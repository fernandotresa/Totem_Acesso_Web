import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultiplePage } from './multiple';

@NgModule({
  declarations: [
    MultiplePage,
  ],
  imports: [
    IonicPageModule.forChild(MultiplePage),
  ],
})
export class MultiplePageModule {}
