import {Component, Input} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    DialogModule,
    ProgressSpinnerModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  @Input()
  zeigenLadeDialog = false;

}
