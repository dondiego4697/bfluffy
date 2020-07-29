import {createUser} from 'server/v1/db-provider/user/api/create-user';
import {
	verifiedUser,
	updateVerifiedCodeByEmail
} from 'server/v1/db-provider/user/api/update-user';
import {getUserByEmail} from 'server/v1/db-provider/user/api/get-user';

export const UserDbProvider = {
	createUser,
	updateVerifiedCodeByEmail,
	verifiedUser,
	getUserByEmail
};
