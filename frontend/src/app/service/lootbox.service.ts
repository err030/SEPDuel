import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Global} from "../../global";
import {Lootbox} from "../model/lootbox.model";

@Injectable({
  providedIn: 'root'
})
export class LootboxService {

  private apiUrlAdmin = Global.backendUrl + '/admin/generateLootbox';
  private apiUrlUser = Global.backendUrl + '/users';

  constructor(private http:HttpClient) { }

  generateLootbox(type:string) : Observable<Lootbox>{
    let params = new HttpParams().set('type',type)
    return this.http.get<Lootbox>(this.apiUrlAdmin, {params: params});
  }

  buyLootbox(lootboxId:number,userId:number) : Observable<any>{
    const url = Global.userRestServiceUrl + "/buyLootbox/" + userId + "/" + lootboxId;
    return this.http.post(url,null,{responseType: 'text'});
  }

  openLootbox(lootboxId:number,userId:number) : Observable<any>{
    const url = Global.userRestServiceUrl + "/openLootbox/" + userId + "/" + lootboxId;
    return this.http.post(url,null);
  }
  claimLootbox(userId : number) : Observable<any>{
    const url = Global.userRestServiceUrl + "/claimLootbox/" + userId;
    return this.http.post(url,null);
  }
}
