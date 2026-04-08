import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { TableComponent } from './components/table/table.component';
import { ChartComponent } from './components/chart/chart.component';
import { ModalComponent } from './components/modal/modal.component';
import { ButtonComponent } from './components/button/button.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { BadgeComponent } from './components/badge/badge.component';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  declarations: [
    CardComponent,
    TableComponent,
    ChartComponent,
    ModalComponent,
    ButtonComponent,
    TabsComponent,
    BadgeComponent,
    LoaderComponent
  ],
  imports: [CommonModule],
  exports: [
    CardComponent,
    TableComponent,
    ChartComponent,
    ModalComponent,
    ButtonComponent,
    TabsComponent,
    BadgeComponent,
    LoaderComponent
  ]
})
export class SharedModule {}

