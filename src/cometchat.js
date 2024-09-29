import { CometChat } from "@cometchat-pro/chat";

const appID = "263798b519441693";
const region = "us";
const authKey = "72fc3f5d51baa5072b3d3e1c555c26ac1ec7234f";

const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
CometChat.init(appID, appSetting).then(
  () => {
    console.log("Initialization completed successfully");
  },
  error => {
    console.log("Initialization failed with error:", error);
  }
);
