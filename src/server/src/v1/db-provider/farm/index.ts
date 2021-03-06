import {createFarm} from 'server/v1/db-provider/farm/api/create-farm';
import {updateFarm} from 'server/v1/db-provider/farm/api/update-farm';
import {getFarmByPublicId} from 'server/v1/db-provider/farm/api/get-farm-by-public-id';
import {archiveFarm} from 'server/v1/db-provider/farm/api/archive-farm';
import {getFarmListByUserId} from 'server/v1/db-provider/farm/api/get-farm-list-by-user-id';

export const FarmDbProvider = {
	createFarm,
	updateFarm,
	getFarmByPublicId,
	archiveFarm,
	getFarmListByUserId
};
