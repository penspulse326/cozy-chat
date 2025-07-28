// import type { CreateUserPayload } from '@packages/lib/dist';

// import UserModel from '@/models/user.model';

// async function createUser(user: CreateUserPayload) {
//   const currentTime = new Date();
//   const newUser = await UserModel.createUser({
//     ...user,
//     created_at: currentTime,
//     last_active_at: currentTime,
//   });

//   return newUser;
// }

// async function getUserById(id: string) {
//   const user = await UserModel.getUserById(id);
//   return user;
// }

// // async function updateUser(user: UpdateUserPayload) {
// //   const updatedUser = await UserModel.updateUser(user);
// //   return updatedUser;
// // }

// export default {
//   createUser,
//   getUserById,
// };
