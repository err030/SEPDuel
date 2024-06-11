import {Component, OnInit} from '@angular/core';
import {Lootbox} from "../../model/lootbox.model";
import {LootboxService} from "../../service/lootbox.service";
import {KeyValuePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {CardDisplayComponent} from "../card-display/card-display.component";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-lootbox',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    KeyValuePipe,
    CardDisplayComponent,
  ],
  templateUrl: './lootbox.component.html',
  styleUrl: './lootbox.component.css'
})
export class LootboxComponent implements OnInit{

  lootboxes: Lootbox[] = []
  userId : number | undefined ;
  cards: any[] = []

  constructor(private lootboxService: LootboxService, private userService: UserService) {}

  buyLootbox(lootboxId: number) {
    if (this.userId !== undefined) {
      this.lootboxService.buyLootbox(lootboxId,this.userId).subscribe(
        (response) => {alert('Lootbox purchased:' + response)},
        (error) => {console.log('Error purchasing Lootbox', error);
          alert('Failed to purchase Lootbox: ' + error.error)}
      )
    }
  }

  openLootbox(lootboxId: number) {
    if (this.userId !== undefined) {
      this.lootboxService.openLootbox(lootboxId,this.userId).subscribe(
        (cards) => {this.cards = cards;},
        (error) => {console.log('Error opening Lootbox', error);
          alert('Failed to open Lootbox: ' + error.error)}
      )
    }
  }

  ngOnInit(): void {
    this.userId = this.userService.loggedUser?.id; //user info may change during this life circle,dynamic
    this.getAllBronzeLootboxes();
    this.getAllSilverLootboxes();
    this.getAllGoldLootboxes();
  }

  getAllBronzeLootboxes():void{
    this.lootboxService.generateLootbox('BRONZE').subscribe(
      (lootbox ) => {this.lootboxes.push(lootbox);},
      error => {console.log('Error creating Lootbox:',error)}
    )
  }
  getAllSilverLootboxes():void{
    this.lootboxService.generateLootbox('SILVER').subscribe(
      (lootbox ) => {this.lootboxes.push(lootbox);},
      error => {console.log('Error creating Lootbox:',error)}
    )
  }
  getAllGoldLootboxes():void{
    this.lootboxService.generateLootbox('GOLD').subscribe(
      (lootbox ) => {this.lootboxes.push(lootbox);},
      error => {console.log('Error creating Lootbox:',error)}
    )
  }

}
