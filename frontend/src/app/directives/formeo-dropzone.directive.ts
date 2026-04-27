//frontend/src/app/directives/formeo-dropzone.directive.ts
import { Directive, ElementRef, NgZone, Output, EventEmitter } from '@angular/core';
import { CdkDropList, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';

@Directive({
  selector: '[formeoDropzone]',
  standalone: true,
  providers: [CdkDropList, CdkDropListGroup]
})
export class FormeoDropzoneDirective {

  @Output() itemDropped = new EventEmitter<{ sectionId: string, item: any }>();

  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private dropList: CdkDropList
  ) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.dropList.dropped.subscribe((event: CdkDragDrop<any>) => {
        const sectionId = this.el.nativeElement.closest('.formeo-field')?.id;
        this.zone.run(() => {
          this.itemDropped.emit({ sectionId, item: event.item.data });
        });
      });
    });
  }
}