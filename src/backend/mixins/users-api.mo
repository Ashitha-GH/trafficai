import Map "mo:core/Map";
import UserTypes "../types/users";
import UserLib "../lib/users";

mixin (
  users : Map.Map<Principal, UserLib.UserProfile>,
) {
  public shared ({ caller }) func registerUser(
    email : Text,
    role : UserTypes.UserRole,
  ) : async UserTypes.UserProfilePublic {
    UserLib.register(users, caller, email, role);
  };

  public shared query ({ caller }) func getUserProfile() : async ?UserTypes.UserProfilePublic {
    UserLib.getProfile(users, caller);
  };

  public shared ({ caller }) func updateUserRole(
    target : Principal,
    newRole : UserTypes.UserRole,
  ) : async Bool {
    UserLib.updateRole(users, target, newRole);
  };
};
