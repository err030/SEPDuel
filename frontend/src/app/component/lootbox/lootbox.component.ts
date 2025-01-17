import {Component, Input, OnInit} from '@angular/core';
import {Lootbox} from "../../model/lootbox.model";
import {LootboxService} from "../../service/lootbox.service";
import {KeyValuePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../service/user.service";
import {DialogModule} from "primeng/dialog";
import {SharedModule} from "primeng/api";
import {Card} from "../../model/card.model";
import {Global} from "../../global";
import {Router} from "@angular/router";
import {DuelCardComponent} from "../duel-card/duel-card.component";

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
    DuelCardComponent,
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
  claimedLootbox: Card[] = [];

  constructor(private lootboxService: LootboxService, protected userService: UserService, private router: Router) {
  }


  buyLootbox(lootboxId: number) {
    if (this.userId !== undefined) {
      this.lootboxService.buyLootbox(lootboxId, this.userId).subscribe(
        (response) => {
          alert('Lootbox purchased: ' + response);
          const lootbox = this.lootboxes.find(l => l.id === lootboxId);
          if (lootbox) {
            lootbox.purchased = true;
            this.getUser();
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
          const lootbox = this.lootboxes.find(l => l.id === lootboxId);
          if (lootbox) {
            lootbox.purchased = false;
            this.getUser();
          }
        },
        (error) => {
          console.log('Error opening Lootbox', error);
          alert('Please buy a Lootbox!' )
        }
      )
    }
  }

  claimLootbox(lootboxId: number) {
    if (this.claimedLootbox.length > 0) {
      alert("You have claimed Lootbox!");
      return;
    }
      //@ts-ignore
      this.lootboxService.claimLootbox(Global.loggedUser.id).subscribe(
        (cards: Card[]) => {
          this.openedCards.push(...cards);
          this.openDialogs.push(...cards);
          // const lootbox = this.lootboxes.find(l => l.id === lootboxId);
          // if (lootbox) {
          //   lootbox.purchased = false;
          //   this.getUser();
          // }
          this.claimedLootbox.push(...cards);
        },
        (error) => {
          console.log('Error claiming Lootbox', error);
          alert('You did not win the Bet!' )
        }
      )
  }

  ngOnInit()
    :
    void {
    this.userId = this.userService.loggedUser?.id; //user info may change during this life circle,dynamic
    this.getUser();
    this.getAllBronzeLootboxes();
    this.getAllSilverLootboxes();
    this.getAllGoldLootboxes();
  }

  getUser() {
    // @ts-ignore
    this.userService.getUserByUserId(this.userService.loggedUser.id).subscribe(
      (response) => {
        this.userService.loggedUser = response.body;
        Global.loggedUser = response.body;
        localStorage.setItem('loggedUser', JSON.stringify(Global.loggedUser));
      })
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
