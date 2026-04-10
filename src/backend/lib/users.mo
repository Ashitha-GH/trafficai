import Map "mo:core/Map";
import Types "../types/users";

module {
  public type UserProfile = Types.UserProfile;
  public type UserProfilePublic = Types.UserProfilePublic;
  public type UserRole = Types.UserRole;
  public type RegistrationStatus = Types.RegistrationStatus;

  public func register(
    users : Map.Map<Principal, UserProfile>,
    principal : Principal,
    email : Text,
    role : UserRole,
  ) : UserProfilePublic {
    let existing = users.get(principal);
    switch (existing) {
      case (?p) { toPublic(p) };
      case null {
        let profile : UserProfile = {
          principal;
          var role;
          var email;
          var registrationStatus = #pending;
        };
        users.add(principal, profile);
        toPublic(profile);
      };
    };
  };

  public func getProfile(
    users : Map.Map<Principal, UserProfile>,
    principal : Principal,
  ) : ?UserProfilePublic {
    switch (users.get(principal)) {
      case (?p) { ?toPublic(p) };
      case null { null };
    };
  };

  public func updateRole(
    users : Map.Map<Principal, UserProfile>,
    principal : Principal,
    newRole : UserRole,
  ) : Bool {
    switch (users.get(principal)) {
      case (?p) {
        p.role := newRole;
        true;
      };
      case null { false };
    };
  };

  public func toPublic(self : UserProfile) : UserProfilePublic {
    {
      principal = self.principal;
      role = self.role;
      email = self.email;
      registrationStatus = self.registrationStatus;
    };
  };
};
