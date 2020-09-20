import {observable, action, computed} from 'mobx';
import {uniqBy} from 'lodash';

import {GeoRequestBookV1, City} from 'client/lib/request-book/v1/geo';

interface GeoObject {
    type: 'region' | 'city';
    code: string;
    displayName: string;
}

export class GeoModel {
    @observable public cityList: City[] = [];

    @observable public geoObjectList: GeoObject[] = [];

    @computed public get isReady() {
        return this.geoObjectList.length > 0;
    }

    constructor() {
        this.init();
    }

    @action public init() {
        return GeoRequestBookV1.getCityList().then((response) => {
            this.cityList = response;

            const regionsRaw: GeoObject[] = [];
            const cities = this.cityList.map<GeoObject>((item) => {
                regionsRaw.push({
                    type: 'region',
                    code: item.regionCode,
                    displayName: item.regionDisplayName
                });

                return {
                    type: 'city',
                    code: item.cityCode,
                    displayName: item.cityDisplayName
                };
            });

            this.geoObjectList = [
                ...cities,
                ...uniqBy(regionsRaw, 'code').filter((item) => !['moskva'].includes(item.code))
            ];
        });
    }
}
