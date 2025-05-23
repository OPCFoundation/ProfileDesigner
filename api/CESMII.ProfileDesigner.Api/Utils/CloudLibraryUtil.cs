﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Mail;

using Microsoft.Extensions.Logging;
using SendGrid.Helpers.Mail;

using CESMII.Common.SelfServiceSignUp.Services;
using CESMII.ProfileDesigner.DAL.Models;
using CESMII.ProfileDesigner.Common.Enums;
using CESMII.ProfileDesigner.Api.Controllers;
using CESMII.ProfileDesigner.Api.Shared.Extensions;
using CESMII.ProfileDesigner.Api.Models;
using CESMII.ProfileDesigner.Api.Shared.Models;

namespace CESMII.ProfileDesigner.Api.Utils
{

    public class CloudLibraryUtil
    {
        private readonly MailRelayService _mailService;
        protected readonly ILogger<CloudLibraryUtil> _logger;
        protected const string PROFILEINFO_SUBJECT = "CESMII | Profile Designer | {{Type}}";

        public CloudLibraryUtil()
        {
        }

        public CloudLibraryUtil(MailRelayService mailservice, ILogger<CloudLibraryUtil> logger)
        {
            _mailService = mailservice;
            _logger = logger;
        }

        public static string GetApprovalStatusString(ProfileStateEnum val)
        {
            switch (val)
            {
                case ProfileStateEnum.CloudLibPublished: return "PUBLISHED";
                case ProfileStateEnum.CloudLibPending: return "PENDING";
                case ProfileStateEnum.CloudLibApproved: return "APPROVED";
                case ProfileStateEnum.CloudLibRejected: return "REJECTED";
                case ProfileStateEnum.CloudLibCancelled: return "CANCELED";
                case ProfileStateEnum.Local: 
                case ProfileStateEnum.Core: 
                    return "";
                default: return "UNKNOWN";
            }
        }

        /// <summary>
        /// Email a notification for publish
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="user"></param>
        public async Task EmailPublishNotification(ProfileController controller, ProfileModel profile, UserModel user)
        {
            // Send email to notify recipient that we have received the publish request
            try
            {
                var strSubject = PROFILEINFO_SUBJECT.Replace("{{Type}}", "Profile Submission");
                var emailInfo = new EmailDataModel(profile, user, strSubject);
                string strViewName = "~/Views/Template/EmailProfileSubmission.cshtml";
                string strBody = await controller.RenderViewAsync(strViewName, profile);
                await SendEmailNotification(emailInfo, strBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email notification for publish request {profile.ID} for user {user.ID}");
            }
        }

        /// <summary>
        /// Email a notification for a cancel publish
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="user"></param>
        public async Task EmailCancelNotification(CloudLibraryController controller, ProfileModel profile, UserModel user)
        {
            // Send email to notify recipient that we have received the cancel publish request
            try
            {
                var strSubject = PROFILEINFO_SUBJECT.Replace("{{Type}}", "CANCEL Profile Submission");
                var emailInfo = new EmailDataModel(profile, user, strSubject);
                string strViewName = "~/Views/Template/EmailCancelProfileSubmission.cshtml";
                string strBody = await controller.RenderViewAsync(strViewName, profile);
                await SendEmailNotification(emailInfo, strBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email notification for cancellation request {profile.ID} for user {user.ID}");
            }
        }

        /// <summary>
        /// Email a notification for APPROVED profile submission
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="user"></param>
        public async Task EmailApprovedNotification(CloudLibraryController controller, ProfileModel profile, SubmittedProfileModel submittedprofile, UserModel user)
        {
            // Send email to notify recipient that we have approved their profile submission
            try
            {
                var strSubject = PROFILEINFO_SUBJECT.Replace("{{Type}}", "*Approved* Profile Submission");
                var emailInfo = new EmailDataModel(profile, user, strSubject);
                string strViewName = "~/Views/Template/EmailApprovedProfileSubmission.cshtml";
                string strBody = await controller.RenderViewAsync(strViewName, submittedprofile);
                await SendEmailNotification(emailInfo, strBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email notification for approved profile {profile.ID} for user {user.ID}");
            }
        }

        /// <summary>
        /// Email a notification for REJECTED profile submission
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="user"></param>
        public async Task EmailRejectedNotification(CloudLibraryController controller, ProfileModel profile, SubmittedProfileModel submittedprofile, UserModel user)
        {
            // Send email to notify recipient that we have rejected their profile submission
            try
            {
                var strSubject = PROFILEINFO_SUBJECT.Replace("{{Type}}", "*Rejected* Profile Submission");
                var emailInfo = new EmailDataModel(profile, user, strSubject);
                string strViewName = "~/Views/Template/EmailRejectedProfileSubmission.cshtml";
                string strBody = await controller.RenderViewAsync(strViewName, submittedprofile);
                await SendEmailNotification(emailInfo, strBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email notification for rejected profile {profile.ID} for user {user.ID}");
            }
        }

        /// <summary>
        /// Email a notification for all other status changes
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="user"></param>
        public async Task EmailStatusChanged(CloudLibraryController controller, ProfileModel profile, SubmittedProfileModel submittedprofile, UserModel user)
        {
            // Send email to notify recipient that we have changed the status of their profile
            try
            {
                var strSubject = PROFILEINFO_SUBJECT.Replace("{{Type}}", "*Update* Profile Submission");
                var emailInfo = new EmailDataModel(profile, user, strSubject);
                string strViewName = "~/Views/Template/EmailStatusChangeProfileSubmission.cshtml";
                string strBody = await controller.RenderViewAsync(strViewName, submittedprofile);
                await SendEmailNotification(emailInfo, strBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email status change for profile {profile.ID} for user {user.ID}");
            }
        }

        #region Email notification helpers

        /// <summary>
        /// Todo: public for now until we convert over ProfileController code to use the private method.
        /// </summary>
        public async Task SendEmailNotification(EmailDataModel emailInfo, string body)
        {
            // Setup "To" list 
            // List of recipients for the notification email.
            List<EmailAddress> leaTo = new List<EmailAddress>();
            if (emailInfo.AuthorEmail.ToLower() != emailInfo.SenderEmail.ToLower())
                leaTo.Add(new EmailAddress(emailInfo.AuthorEmail, emailInfo.AuthorDisplayName));
            leaTo.Add(new EmailAddress(emailInfo.SenderEmail, emailInfo.SenderDisplayName));

            // Setup Contents of our email message.
            MailMessage mm = new MailMessage()
            {
                Subject = emailInfo.Subject,
                Body = body
            };

            await _mailService.SendEmailSendGrid(mm, leaTo);
        }
        #endregion

    }
}
