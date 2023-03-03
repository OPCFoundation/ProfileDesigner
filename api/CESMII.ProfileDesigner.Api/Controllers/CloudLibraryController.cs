﻿using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

using CESMII.ProfileDesigner.Common;
using CESMII.ProfileDesigner.DAL.Models;
using CESMII.ProfileDesigner.DAL;
using CESMII.ProfileDesigner.Api.Shared.Models;
using CESMII.ProfileDesigner.Api.Shared.Controllers;
using CESMII.ProfileDesigner.Data.Entities;
using CESMII.ProfileDesigner.Common.Enums;
using CESMII.ProfileDesigner.Api.Utils;
using CESMII.Common.CloudLibClient;

namespace CESMII.ProfileDesigner.Api.Controllers
{

    [Route("api/[controller]")]
    [Authorize]
    public class CloudLibraryController : BaseController<UserController>
    {
        private readonly ICloudLibDal<CloudLibProfileModel> _dalCloudLib;
        private readonly IDal<Profile, ProfileModel> _dalProfile;
        private readonly CloudLibraryUtil _cloudLibUtil;

        public CloudLibraryController(
            ICloudLibDal<CloudLibProfileModel> cloudLibDal,
            IDal<Profile, ProfileModel> profileDal,
            UserDAL userDal,
            ConfigUtil config, 
            CloudLibraryUtil cloudLibUtil,
            ILogger<UserController> logger)
            : base(config, logger, userDal)
        {
            _dalCloudLib = cloudLibDal;
            _dalProfile = profileDal;
            _cloudLibUtil = cloudLibUtil;
        }


        [HttpPost, Route("pendingapprovals")]
        [Authorize(Roles = "cesmii.profiledesigner.admin")]
        [ProducesResponseType(200, Type = typeof(DALResult<CloudLibProfileModel>))]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetPendingApprovalAsync()
        {
            // TODO implement search/filter/pagination
            var pendingNodeSetsResult = await _dalCloudLib.GetNodeSetsPendingApprovalAsync(100, null, false, null);
            if (pendingNodeSetsResult == null)
            {
                return BadRequest($"No records found.");
            }

            DALResult<CloudLibProfileModel> result = new DALResult<CloudLibProfileModel>
            {
                Count = pendingNodeSetsResult.Nodes.Count(),
                Data = pendingNodeSetsResult.Nodes
                        .OrderBy(x => x.ProfileState)
                        .ThenBy(x => (string.IsNullOrEmpty(x.Title) 
                                ? x.Namespace.Replace("https://","").Replace("http://", "") : x.Title).Trim())
                        .ThenBy(x => x.Namespace.Replace("https://", "").Replace("http://", "").Trim())
                        .ThenBy(x => x.PublishDate)
                        .ToList(),
                EndCursor = pendingNodeSetsResult.PageInfo.EndCursor,
                StartCursor = pendingNodeSetsResult.PageInfo.StartCursor,
                HasNextPage = pendingNodeSetsResult.PageInfo.HasNextPage,
                HasPreviousPage = pendingNodeSetsResult.PageInfo.HasPreviousPage,
            };

            return Ok(result);
        }

        /// <summary>
        /// Changes publish status of a profile in the Cloud Library. 
        /// Could be approved, rejected, cancelled.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost, Route("approve")]
        [Authorize(Roles = "cesmii.profiledesigner.admin")]
        [ProducesResponseType(200, Type = typeof(CloudLibProfileModel))]
        [ProducesResponseType(400)]
        public async Task<IActionResult> ApproveProfileAsync([FromBody] ApprovalModel model)
        {
            if (model == null)
            {
                _logger.LogWarning($"ProfileController|ApproveProfile|Invalid model (null)");
                return BadRequest($"Invalid model (null)");
            }

            if (string.IsNullOrEmpty(model.ID))
            {
                _logger.LogWarning($"ProfileController|ApproveProfile|Failed to approve : {model.ID}. Profile has no cloud library id.");
                return Ok(
                    new ResultMessageWithDataModel()
                    {
                        IsSuccess = false,
                        Message = "Profile not in cloud library."
                    }
                );

            }

            var approvedNodeSet = await _dalCloudLib.UpdateApprovalStatusAsync(model.ID, 
                CloudLibraryUtil.GetApprovalStatusString(model.ApproveState), model.ApprovalDescription);
            if (approvedNodeSet == null)
            {
                return BadRequest($"Approval update failed.");
            }

            //Todo: Get the authoring user - from author field or additional properties. 
            //      Then notify them that the status has changed to approved, rejected, etc.
            //      if rejected, include reason in email. 
            //      if approved, explain that this profile is now a part of the Cloud Library and cannot
            //         be edited or removed. 
            //      They can publish a new version if needed.  
            //notify author that their profile publish status has changed. 
            //await _cloudLibUtil.EmailStatusNotification(profile, LocalUser);

            return Ok(approvedNodeSet);
        }

        /// <summary>
        /// Cancels a publish profile to the Cloud Library. 
        /// This is called by the authoring user. 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost, Route("publishcancel")]
        [ProducesResponseType(200, Type = typeof(ResultMessageWithDataModel))]
        public async Task<IActionResult> CancelPublishToCloudLibrary([FromBody] IdIntModel model)
        {
            if (model == null)
            {
                _logger.LogWarning("ProfileController|CancelPublishToCloudLibrary|Invalid model");
                return BadRequest("Profile|CloudLibrary||PublishCancel|Invalid model");
            }

            try
            {
                var profile = _dalProfile.GetById(model.ID, base.DalUserToken);
                if (profile == null)
                {
                    _logger.LogWarning($"ProfileController|CancelPublishToCloudLibrary|Failed to cancel : {model.ID}. Profile not found.");
                    return Ok(
                        new ResultMessageWithDataModel()
                        {
                            IsSuccess = false,
                            Message = "Profile not found."
                        }
                    );
                }

                try
                {
                    var updatedProfile = await _dalCloudLib.UpdateApprovalStatusAsync(profile.CloudLibraryId,
                        CloudLibraryUtil.GetApprovalStatusString(ProfileStateEnum.CloudLibCancelled), $"Canceled by user {DalUserToken.UserId}");
                    if (updatedProfile == null || updatedProfile.CloudLibApprovalStatus == null ||
                        updatedProfile.CloudLibApprovalStatus == CloudLibraryUtil.GetApprovalStatusString(ProfileStateEnum.CloudLibCancelled))
                    {
                        profile.CloudLibraryId = null;
                        profile.CloudLibPendingApproval = null;
                        await _dalProfile.UpdateAsync(profile, base.DalUserToken);
                    }
                    else
                    {
                        _logger.LogWarning($"ProfileController|CancelPublishToCloudLibrary|Failed to cancel : {model.ID}. Status Update failed.");
                        return Ok(
                            new ResultMessageWithDataModel()
                            {
                                IsSuccess = false,
                                Message = "Status update failed."
                            }
                        );

                    }
                }
                catch (UploadException ex)
                {
                    _logger.LogError($"ProfileController|CancelPublishToCloudLibrary|Failed to cancel publish request to Cloud Library: {model.ID} {ex.Message}.");
                    return Ok(
                        new ResultMessageWithDataModel()
                        {
                            IsSuccess = false,
                            Message = ex.Message,
                        }
                    );
                }

                //notify
                await _cloudLibUtil.EmailCancelNotification(this,profile, LocalUser);

                //return all good
                return Ok(
                    new ResultMessageWithDataModel()
                    {
                        IsSuccess = true,
                        Message = "Cancelled publish request.",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"ProfileController|CancelPublishToCloudLibrary|Failed to cancel publish request to Cloud Library: {model.ID} {ex.Message}.");
                return Ok(
                    new ResultMessageWithDataModel()
                    {
                        IsSuccess = false,
                        Message = "Error cancelling publish request."
                    }
                );
            }
        }
    }
}
