import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultiplePage } from './multiple';
import { TooltipsModule } from 'ionic-tooltips';

@NgModule({
  declarations: [
    MultiplePage,
  ],
  imports: [
    IonicPageModule.forChild(MultiplePage),
    TooltipsModule.forRoot(),
  ],
})
export class MultiplePageModule {}
