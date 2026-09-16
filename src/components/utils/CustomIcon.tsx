import SaveIcon from "@mui/icons-material/Save";

import AccountIcon from "../../assets/images/account_plain.svg?react";
import AppleBlackLogo from "../../assets/images/apple_logo_black.svg?react";
import BliroLogo from "../../assets/images/bliro_logo.svg?react";
import BliroLogoAndText from "../../assets/images/bliro_logo_and_text.svg?react";
import BliroLogoAppIcon from "../../assets/images/bliro_logo_app_icon.svg?react";
import BliroDarkLogo from "../../assets/images/bliro_logo_dark.svg?react";
import ContactIcon from "../../assets/images/contact_plain.svg?react";
import SFEventIcon from "../../assets/images/event_plain.svg?react";
import GoogleIcon from "../../assets/images/google_logo.svg?react";
import HubspotIcon from "../../assets/images/hubspot_logo.svg?react";
import HubspotIconBw from "../../assets/images/hubspot_plain_bw.svg?react";
import LeadIcon from "../../assets/images/lead_plain.svg?react";
import MacIcon from "../../assets/images/mac.svg?react";
import WindowsIcon from "../../assets/images/microsoft.png";
import MicrosoftDynamicsIcon from "../../assets/images/microsoft_dynamics_logo.svg?react";
import MicrosoftIcon from "../../assets/images/microsoft_logo.svg?react";
import OpportunityIcon from "../../assets/images/opportunity_plain.svg?react";
import OutlookIcon from "../../assets/images/outlook_logo.svg?react";
import PsoIcon from "../../assets/images/pso_plain.svg?react";
import SalesforceIcon from "../../assets/images/salesforce_logo.svg?react";
import SalesforceIconBw from "../../assets/images/salesforce_logo_plain_bw.svg?react";
import SapIcon from "../../assets/images/sap-c4c_logo.png";
import SlackIcon from "../../assets/images/slack_logo.svg?react";
import SlackIconBw from "../../assets/images/slack_logo_plain_bw.svg?react";
import SFTaskCallIcon from "../../assets/images/task-call_plain.svg?react";
import SFTaskIcon from "../../assets/images/task_plain.svg?react";
import TeamsIcon from "../../assets/images/teams_logo.svg?react";
import TeamsIconBw from "../../assets/images/teams_logo_plain_bw.svg?react";
import AttendeeIcon from "../../assets/images/unknown-user_plain.svg?react";
import UserIcon from "../../assets/images/user_plain.svg?react";

interface ICustomIconProps {
  icon: string;
  width?: number | string;
  height?: number | string;
}
export const CustomIcon = ({ icon, width = 24, height = 24 }: ICustomIconProps) => {
  switch (icon) {
    case "BliroLogo":
      return <BliroLogo width={width} height={height} />;
    case "BliroDarkLogo":
      return <BliroDarkLogo width={width} height={height} />;
    case "BliroLogoAndText":
      return <BliroLogoAndText width={width} height={height} />;
    case "BliroLogoAppIcon":
      return <BliroLogoAppIcon width={width} height={height} />;
    case "GoogleCalendarIcon":
    case "GmailIcon":
      return <GoogleIcon width={width} height={height} />;
    case "MicrosoftLogo":
      return <MicrosoftIcon width={width} height={height} />;
    case "SalesforceIcon":
      return <SalesforceIcon width={width} height={height} />;
    case "HubspotIcon":
      return <HubspotIcon width={width} height={height} />;
    case "OutlookIcon":
      return <OutlookIcon width={width} height={height} />;
    case "SlackIcon":
      return <SlackIcon width={width} height={height} />;
    case "SapIcon":
      return <img src={SapIcon} alt="SAP" width={width} height={height} />;
    case "MSTeamsIcon":
      return <TeamsIcon width={width} height={height} />;
    case "MicrosoftDynamicsIcon":
      return <MicrosoftDynamicsIcon width={width} height={height} />;
    case "WindowsIcon":
      return <img src={WindowsIcon} alt="Windows" width={width} height={height} />;
    case "AppleBlackLogo":
      return <AppleBlackLogo width={width} height={height} />;
    case "MacIcon":
      return <MacIcon width={width} height={height} />;
    case "BritishFlagIcon":
      return (
        <span aria-label="british-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇬🇧
        </span>
      );
    case "AustralianFlagIcon":
      return (
        <span aria-label="australian-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇦🇺
        </span>
      );
    case "USFlagIcon":
      return (
        <span aria-label="us-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇺🇸
        </span>
      );
    case "SpanishFlagIcon":
      return (
        <span aria-label="spanish-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇪🇸
        </span>
      );
    case "FrenchFlagIcon":
      return (
        <span aria-label="french-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇫🇷
        </span>
      );
    case "GermanFlagIcon":
      return (
        <span aria-label="german-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇩🇪
        </span>
      );
    case "ItalianFlagIcon":
      return (
        <span aria-label="italian-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇮🇹
        </span>
      );
    case "PortugueseFlagIcon":
      return (
        <span aria-label="portuguese-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇵🇹
        </span>
      );
    case "DutchFlagIcon":
      return (
        <span aria-label="dutch-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇳🇱
        </span>
      );
    case "HindiFlagIcon":
      return (
        <span aria-label="hindi-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇮🇳
        </span>
      );
    case "JapaneseFlagIcon":
      return (
        <span aria-label="japanese-flag-icon" role="img" style={{ fontSize: width || height }}>
          🇯🇵
        </span>
      );
    case "SlackIconBW":
      return <SlackIconBw width={width} height={height} />;
    case "SalesforceIconBW":
      return <SalesforceIconBw width={width} height={height} />;
    case "MSTeamsIconBW":
      return <TeamsIconBw width={width} height={height} />;
    case "OpportunityIcon":
      return <OpportunityIcon width={width} height={height} />;
    case "AccountIcon":
      return <AccountIcon width={width} height={height} />;
    case "LeadIcon":
      return <LeadIcon width={width} height={height} />;
    case "ContactIcon":
      return <ContactIcon width={width} height={height} />;
    case "AttendeeIcon":
      return <AttendeeIcon width={width} height={height} />;
    case "UserIcon":
      return <UserIcon width={width} height={height} />;
    case "SFEventIcon":
      return <SFEventIcon width={width} height={height} />;
    case "SFTaskCallIcon":
      return <SFTaskCallIcon width={width} height={height} />;
    case "SFTaskIcon":
      return <SFTaskIcon width={width} height={height} />;
    case "PsoIcon":
      return <PsoIcon width={width} height={height} />;
    case "HubspotIconBW":
      return <HubspotIconBw width={width} height={height} />;
    case "BliroAppIcon":
      return <BliroLogoAppIcon width={width} height={height} />;
    case "WaveIcon":
      return (
        <span aria-label="wave-icon" role="img" style={{ fontSize: width || height }}>
          👋
        </span>
      );
    case "ArrowUpIcon":
      return (
        <span aria-label="arrow-up-icon" role="img" style={{ fontSize: width || height }}>
          ⬆
        </span>
      );
    case "ArrowDownIcon":
      return (
        <span aria-label="arrow-down-icon" role="img" style={{ fontSize: width || height }}>
          ⬇
        </span>
      );
    case "CelebrationIcon":
      return (
        <span aria-label="celebration-icon" role="img" style={{ fontSize: width || height }}>
          🎉
        </span>
      );
    case "GrabIcon":
      return (
        <span aria-label="grab-icon" role="img" style={{ fontSize: width || height }}>
          ✊
        </span>
      );
    case "DropIcon":
      return (
        <span aria-label="drop-icon" role="img" style={{ fontSize: width || height }}>
          🫳
        </span>
      );
    default:
      return <SaveIcon width={width} height={height} />;
  }
};
