import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemoryListPage } from './memory-list';

@NgModule({
  declarations: [
    MemoryListPage,
  ],
  imports: [
    IonicPageModule.forChild(MemoryListPage),
  ],
})
export class MemoryListPageModule {}
