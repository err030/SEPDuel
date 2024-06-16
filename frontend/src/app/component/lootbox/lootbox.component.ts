import {Component, Input, OnInit} from '@angular/core';
import {Lootbox} from "../../model/lootbox.model";
import {LootboxService} from "../../service/lootbox.service";
import {KeyValuePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../service/user.service";
import {DialogModule} from "primeng/dialog";
import {SharedModule} from "primeng/api";
import {Card} from "../../model/card.model";
import {Router} from "@angular/router";
import { Global } from '../../../global';

@Component({
  selector: 'app-lootbox',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    KeyValuePipe,
    DialogModule,
    SharedModule,
  ],
  templateUrl: './lootbox.component.html',
  styleUrl: './lootbox.component.css'
})
export class LootboxComponent implements OnInit {
  @Input() card?: Card;
  lootboxes: Lootbox[] = [];
  userId: number | undefined;
  cards: any[] = [];
  protected readonly Global = Global;
  openedCards: Card[] = [];
  openDialogs: Card[] = [];
  // displayDialog: boolean = false;

  constructor(private lootboxService: LootboxService, private userService: UserService, private router: Router) {
  }


  buyLootbox(lootboxId: number) {
    if (this.userId !== undefined) {
      this.lootboxService.buyLootbox(lootboxId, this.userId).subscribe(
        (response) => {
          alert('Lootbox purchased: ' + response);
          const lootbox = this.lootboxes.find(l => l.id === lootboxId);
          if (lootbox) {
            lootbox.purchased = true;
          }
        },
        (error) => {
          console.log('Error purchasing Lootbox', error);
          alert('Failed to purchase Lootbox: ' + error.error)
        }
      );
    }
  }

  openLootbox(lootboxId: number) {
    if (this.userId !== undefined) {
      this.lootboxService.openLootbox(lootboxId, this.userId).subscribe(
        (cards: Card[]) => {
          this.openedCards.push(...cards);
          this.openDialogs.push(...cards);
        },
        (error) => {
          console.log('Error opening Lootbox', error);
          alert('Please buy a Lootbox!' )
        }
      )
    }
  }

  ngOnInit()
    :
    void {
    this.userId = this.userService.loggedUser?.id; //user info may change during this life circle,dynamic
    this.getAllBronzeLootboxes();
    this.getAllSilverLootboxes();
    this.getAllGoldLootboxes();
  }

  getAllBronzeLootboxes()
    :
    void {
    this.lootboxService.generateLootbox('BRONZE').subscribe(
      (lootbox) => {
        this.lootboxes.push({...lootbox, purchased: false});
      },
      error => {
        console.log('Error creating Lootbox:', error)
      }
    )
  }

  getAllSilverLootboxes()
    :
    void {
    this.lootboxService.generateLootbox('SILVER').subscribe(
      (lootbox) => {
        this.lootboxes.push({...lootbox, purchased: false});
      },
      error => {
        console.log('Error creating Lootbox:', error)
      }
    )
  }

  getAllGoldLootboxes()
    :
    void {
    this.lootboxService.generateLootbox('GOLD').subscribe(
      (lootbox) => {
        this.lootboxes.push({...lootbox, purchased: false});
      },
      error => {
        console.log('Error creating Lootbox:', error)
      }
    )
  }

  closeAllDialogs() {
    this.openDialogs = [];
  }

  goToHome() {
    this.router.navigate(['/homepage-user']);
  }
}
