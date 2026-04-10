import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;

  public type UserRole = {
    #EmergencyResponder;
    #ControlPanelAdmin;
    #TrafficPolice;
    #GeneralUser;
  };

  public type RegistrationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type UserProfile = {
    principal : UserId;
    var role : UserRole;
    var email : Text;
    var registrationStatus : RegistrationStatus;
  };

  public type UserProfilePublic = {
    principal : UserId;
    role : UserRole;
    email : Text;
    registrationStatus : RegistrationStatus;
  };
};
