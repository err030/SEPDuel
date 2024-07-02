import {Component, OnInit} from '@angular/core';
import {Duel} from "../../model/duel.model";
import {DuelService} from "../../service/duel.service";
import {Router} from "@angular/router";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-sep-tv',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './sep-tv.component.html',
  styleUrl: './sep-tv.component.css'
})
export class SepTvComponent implements OnInit {
  duel?: Duel;
  duels: Duel[] = [];

  constructor(private duelService: DuelService, private router: Router) {
  }

  ngOnInit(): void {
    this.refreshDuels();
  }

  refreshDuels() {
    setInterval(() => {
      this.loadDuels();
    }, 1000)
  }

  private loadDuels() {
    this.duelService.getVisibleDuelList().subscribe({
      next: (duels: any) => {
        if (duels && duels.length > 0) {
          this.duels = duels;
        }
      }
    });
  }

  spectate(id: number) {
    localStorage.setItem('initializer', '2');
    this.router.navigate([`/duel/${id}`]);

  }
}
