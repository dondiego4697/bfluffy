/* eslint-disable no-undef */
import got from 'got';
import * as http from 'http';
import * as nock from 'nock';
import {omit} from 'lodash';
import {app} from 'server/app';
import {TestDb} from 'tests/test-db';
import {startServer, stopServer} from 'tests/test-server';
import {TestFactory} from 'tests/test-factory';
import {AuthToken} from 'server/lib/auth-token';
import {SignUpType, ClientStatusCode} from 'server/types/consts';

const BASE_USER = {
	email: 'test@mail.ru',
	password: 'password'
};

const AUTH_TOKEN = AuthToken.encode(BASE_USER);

const client = got.extend({
	throwHttpErrors: false,
	retry: 0,
	timeout: 2000,
	responseType: 'json',
	headers: {
		cookie: `auth_token=${AUTH_TOKEN}`
	}
});

const REQUEST_PATH = '/api/v1/edit/animal_ad/update';

describe(REQUEST_PATH, () => {
	let server: http.Server;
	let url: string;

	beforeAll(async () => {
		[server, url] = await startServer(app);
		nock.disableNetConnect();
		nock.enableNetConnect(/localhost/);
	});

	afterAll(async () => {
		await stopServer(server);
		nock.enableNetConnect();
	});

	beforeEach(async () => {
		await TestDb.clean();
		await TestFactory.createUser({
			signUpType: SignUpType.EMAIL,
			...BASE_USER
		});
	});

	it('should update animal ad', async () => {
		const animalCategory = await TestFactory.createAnimaCategory();
		const animalBreed = await TestFactory.createAnimalBreed(animalCategory.id);
		const animalAd = await TestFactory.createAnimalAd({
			ownerId: 1,
			breedId: animalBreed.id
		});
		const anotherAnimalBreed = await TestFactory.createAnimalBreed(animalCategory.id);

		const {body, statusCode} = await client.post<any>(
			`${url}${REQUEST_PATH}`,
			{
				json: {
					name: 'updated',
					description: 'updated',
					cost: 0.00,
					sex: !animalAd.sex,
					animalBreedCode: anotherAnimalBreed.code,
					documents: {
						genericMark: true
					}
				},
				searchParams: {
					publicId: animalAd.publicId
				}
			}
		);

		expect(statusCode).toEqual(200);
		expect(body).toEqual({publicId: animalAd.publicId});

		const updatedAnimalAds = await TestFactory.getAllAnimalAds();
		const updatedAnimalAd = updatedAnimalAds.find((item) => item.publicId === animalAd.publicId);

		expect(omit(updatedAnimalAd, ['updatedAt'])).toEqual({
			animalBreedId: 2,
			cost: '0.00',
			createdAt: animalAd.createdAt,
			name: 'updated',
			description: 'updated',
			documents: {
			  	genericMark: true
			},
			id: 1,
			isArchive: false,
			isBasicVaccinations: false,
			ownerId: 1,
			publicId: animalAd.publicId,
			sex: !animalAd.sex,
			viewsCount: 0
		});
	});

	it('should throw error if owner id not equal with request user id', async () => {
		const animalCategory = await TestFactory.createAnimaCategory();
		const animalBreed = await TestFactory.createAnimalBreed(animalCategory.id);
		const user = await TestFactory.createUser({
			signUpType: SignUpType.EMAIL
		});
		const animalAd = await TestFactory.createAnimalAd({
			ownerId: user.id,
			breedId: animalBreed.id
		});

		const {body, statusCode} = await client.post<any>(
			`${url}${REQUEST_PATH}`,
			{
				json: {
					name: 'updated',
					cost: 0.00,
					sex: !animalAd.sex,
					animalBreedCode: animalBreed.code
				},
				searchParams: {
					publicId: animalAd.publicId
				}
			}
		);

		expect(statusCode).toEqual(403);
		expect(body.message).toEqual(ClientStatusCode.ANIMAL_AD_FORBIDDEN);
	});

	it('should throw error if public id does not exist', async () => {
		const animalCategory = await TestFactory.createAnimaCategory();
		const animalBreed = await TestFactory.createAnimalBreed(animalCategory.id);

		const {statusCode} = await client.post<any>(
			`${url}${REQUEST_PATH}`,
			{
				json: {
					name: 'updated',
					cost: 0.00,
					sex: false,
					animalBreedCode: animalBreed.code
				},
				searchParams: {
					publicId: '1fc5a1fe-11ca-4e11-9a02-f157fd97f03d'
				}
			}
		);

		expect(statusCode).toEqual(404);
	});
});