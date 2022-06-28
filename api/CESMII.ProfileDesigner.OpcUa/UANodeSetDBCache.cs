﻿/* Author:      Chris Muench, C-Labs
 * Last Update: 4/8/2022
 * License:     MIT
 * 
 * Some contributions thanks to CESMII – the Smart Manufacturing Institute, 2021
 */
using CESMII.OpcUa.NodeSetImporter;
using CESMII.ProfileDesigner.DAL;
using CESMII.ProfileDesigner.DAL.Models;
using CESMII.ProfileDesigner.Data.Entities;
using CESMII.ProfileDesigner.OpcUa;
using Opc.Ua.Export;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace CESMII.ProfileDesigner.Opc.Ua.NodeSetDBCache
{
    public class UANodeSetDBCache : IUANodeSetCache
    {
        private readonly IDal<NodeSetFile, NodeSetFileModel> _dalNodeSetFile;
        private readonly IDal<StandardNodeSet, StandardNodeSetModel> _dalLookupNodeSet;
        private readonly UserToken _userToken;

        public UANodeSetDBCache(IDal<NodeSetFile, NodeSetFileModel> dalNodeSetFile, IDal<StandardNodeSet, StandardNodeSetModel> dalLookupNodeSet, UserToken userToken)
        {
            _dalNodeSetFile = dalNodeSetFile;
            _dalLookupNodeSet = dalLookupNodeSet;
            _userToken = userToken;
        }

        public void DeleteNewlyAddedNodeSetsFromCache(UANodeSetImportResult results)
        {
            if (results?.Models?.Count > 0)
            {
                foreach (var tMod in results.Models)
                {
                    if (tMod.NewInThisImport)
                    {
                        //TODO: @Sean: If a nodeset is deleted from the cache table, some tables with references to the cache table might be broken.
                        _dalNodeSetFile.DeleteAsync((tMod.NameVersion.CCacheId as NodeSetFileModel)?.ID ?? 0, _userToken); //Must force delete as Author ID is not in the results
                    }
                }
            }
        }

        public ModelValue GetNodeSetByID(string id)
        {
            var tns = _dalNodeSetFile.GetById(int.Parse(id), _userToken);
            if (tns != null)
            {
                UANodeSetImportResult res = new UANodeSetImportResult();
                AddNodeSet(res, tns.FileCache, _userToken);
                if (res?.Models?.Count > 0)
                    return res.Models[0];
            }
            return null;
        }

        public UANodeSetImportResult FlushCache()
        {
            UANodeSetImportResult ret = new UANodeSetImportResult();
            try
            {
                //TODO: @Sean: If a nodeset is deleted from the cache table, some tables with references to the cache table might be broken.
                var t = _dalNodeSetFile.GetAll(_userToken);
                foreach (var rec in t)
                    _dalNodeSetFile.DeleteAsync(rec.ID.Value, _userToken);
            }
            catch (Exception e)
            {
                ret.ErrorMessage = $"Flushing Cache failed: {e}";
            }
            return ret;
        }

        public string GetRawModelXML(ModelValue model)
        {
            return (model?.NameVersion?.CCacheId as NodeSetFileModel)?.FileCache;
        }

        public bool GetNodeSet(UANodeSetImportResult results, ModelNameAndVersion nameVersion, object AuthorID)
        {
            var authorToken = AuthorID as UserToken;
            NodeSetFileModel myModel = GetProfileModel(nameVersion, authorToken);

            if (myModel != null)
            {
                // workaround for bug https://github.com/dotnet/runtime/issues/67622
                var fileCachepatched = myModel.FileCache.Replace("<Value/>", "<Value xsi:nil='true' />");
                using (var nodeSetStream = new MemoryStream(Encoding.UTF8.GetBytes(fileCachepatched)))
                {
                    UANodeSet nodeSet = UANodeSet.Read(nodeSetStream);
                    foreach (var ns in nodeSet.Models)
                    {
                        results.AddModelAndDependencies(nodeSet, ns, null, false);
                        foreach (var model in results.Models)
                        {
                            if (model.NameVersion.CCacheId == null)
                            {
                                if (model.NameVersion.ModelUri == nameVersion.ModelUri && model.NameVersion.PublicationDate == nameVersion.PublicationDate)
                                {
                                    model.NameVersion.CCacheId = myModel;
                                }
                                else
                                {
                                    GetProfileModel(model.NameVersion, authorToken);
                                }
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        }

        private NodeSetFileModel GetProfileModel(ModelNameAndVersion nameVersion, object userId)
        {
            NodeSetFileModel myModel = (nameVersion.CCacheId as NodeSetFileModel);
            if (myModel != null)
            {
                return myModel;
            }

            var userToken = userId as UserToken;
            myModel = _dalNodeSetFile?.Where(s => s.FileName == nameVersion.ModelUri, userToken, verbose: true)?.Data?.OrderByDescending(s => s.PublicationDate)?.FirstOrDefault();
            if (myModel != null)
            {
                nameVersion.CCacheId = myModel;
            }
            return myModel;
        }

        public bool AddNodeSet(UANodeSetImportResult results, string nodeSetXml, object authorId)
        {
            bool WasNewSet = false;
            #region Comment Processing
            var doc = XElement.Load(new StringReader(nodeSetXml));
            var comments = doc.DescendantNodes().OfType<XComment>();
            foreach (XComment comment in comments)
            {
                //inline XML Commments are not showing here...only real XML comments (not file comments with /**/)
                //Unfortunately all OPC UA License Comments are not using XML Comments but file-comments and therefore cannot be "preserved" 
            }
            #endregion

            UANodeSet nodeSet;
            // workaround for bug https://github.com/dotnet/runtime/issues/67622
            var nodeSetXmlPatched = nodeSetXml.Replace("<Value/>", "<Value xsi:nil='true' />");
            using (var nodesetBytes = new MemoryStream(Encoding.UTF8.GetBytes(nodeSetXmlPatched)))
            {
                nodeSet = UANodeSet.Read(nodesetBytes);
            }

            if (nodeSet.Models?.Any() != true)
            {
                nodeSet.Models = new ModelTableEntry[] {
                        new ModelTableEntry { ModelUri = nodeSet.NamespaceUris?.FirstOrDefault(),
                         RequiredModel = new ModelTableEntry[] { new ModelTableEntry { ModelUri = OpcUaImporter.strOpcNamespaceUri } },
                         }
                    };
            }

            UANodeSet tOldNodeSet = null;
            foreach (var ns in nodeSet.Models)
            {
                UserToken userToken = authorId as UserToken;
                var authorToken = userToken;
                bool isGlobalNodeSet = CESMII.ProfileDesigner.OpcUa.OpcUaImporter._coreNodeSetUris.Contains(ns.ModelUri);
                if (isGlobalNodeSet)
                {
                    userToken = UserToken.GetGlobalUser(userToken); // Write as a global node set shared acess user
                    authorToken = null;
                }
                NodeSetFileModel myModel = GetProfileModel(
                    new ModelNameAndVersion
                    {
                        ModelUri = ns.ModelUri,
                        ModelVersion = ns.Version,
                        PublicationDate = ns.PublicationDate,
                    },
                    userToken);
                if (myModel == null)
                {

                    myModel = results.Models.FirstOrDefault(m => m.NameVersion.IsNewerOrSame(new ModelNameAndVersion
                    {
                        ModelUri = ns.ModelUri,
                        ModelVersion = ns.Version,
                        PublicationDate = ns.PublicationDate,
                    }
                     ))?.NameVersion?.CCacheId as NodeSetFileModel;
                }
                bool CacheNewerVersion = true;
                if (myModel != null)
                {
                    CacheNewerVersion = false;
                    // workaround for bug https://github.com/dotnet/runtime/issues/67622
                    var fileCachepatched = myModel.FileCache.Replace("<Value/>", "<Value xsi:nil='true' />");
                    using (var nodeSetStream = new MemoryStream(Encoding.UTF8.GetBytes(fileCachepatched)))
                    {
                        if (tOldNodeSet == null)
                            tOldNodeSet = UANodeSet.Read(nodeSetStream);
                        var tns = tOldNodeSet.Models.Where(s => s.ModelUri == ns.ModelUri).OrderByDescending(s => s.PublicationDate).FirstOrDefault();
                        if (tns == null || ns.PublicationDate > tns.PublicationDate)
                            CacheNewerVersion = true; //Cache the new NodeSet if the old (file) did not contain the model or if the version of the new model is greater
                    }
                }
                int? cacheId = myModel != null ? myModel.ID : 0;
                bool newInImport = false;
                if (CacheNewerVersion) //Cache only newer version
                {
                    if (myModel == null)
                    {
                        myModel = new NodeSetFileModel
                        {
                            ID = cacheId,
                            FileName = ns.ModelUri,
                            Version = ns.Version,
                            PublicationDate = ns.PublicationDate,
                            // TODO clean up the dependency
                            AuthorId = authorToken?.UserId,
                            FileCache = nodeSetXml
                        };
                        // Defer Upsert until later to make it part of a transaction
                        newInImport = true;
                    }
                    // Defer the updates to the import transaction
                    WasNewSet = true;
                }
                var tModel = results.AddModelAndDependencies(nodeSet, ns, null, WasNewSet);
                if (tModel?.NameVersion != null && myModel != null)
                {
                    tModel.NameVersion.CCacheId = myModel;
                    tModel.NewInThisImport = newInImport;
                }
                foreach (var model in results.Models)
                {
                    if (model.NameVersion.CCacheId == null)
                    {
                        GetProfileModel(model.NameVersion, userToken);
                    }
                }
            }
            return WasNewSet;
        }
    }
}
