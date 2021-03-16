import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, filter, finalize, switchMap, tap } from 'rxjs/operators';
import { RequestService } from '../../services/request.service';
import { FuzzySearchEntity } from './fuzzy-search.model';
import { Observable } from 'rxjs';
import { DbManageService } from '../../services/db-manage.service';

@Component({
  selector: 'app-fuzzy-search',
  templateUrl: './fuzzy-search.component.html',
  styleUrls: ['./fuzzy-search.component.scss']
})
export class FuzzySearchComponent implements OnInit {
  @Input() inputmode = 'useScene' || 'useParam' || ' useSql'; // useScene场景 useParam套用参数 useSql套用SQL
  @Output() fuzzySelected = new EventEmitter<any>();
  filteredCase: FuzzySearchEntity[] = [];
  fuzzyForm: FormGroup;
  isLoading = false;
  requestObservable: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private dbManageService: DbManageService
  ) {
    this.fuzzyForm = this.fb.group({
      fuzzyInput: ['']
    });
  }

  ngOnInit(): void {
    this.fuzzyForm.get('fuzzyInput').valueChanges.pipe(
      debounceTime(300),
      filter(value => typeof(value) === 'string'),
      tap(() => this.isLoading = true),
      switchMap(value => {
        if (this.inputmode === 'useScene' || this.inputmode === 'useParam') {
          return this.requestService.getInterfaceCaseListByName({ name: value }).pipe(finalize(() => this.isLoading = false));
        } else if (this.inputmode === 'useSql') {
          return this.dbManageService.queryDatabaseSqlList({ name: value }).pipe(finalize(() => this.isLoading = false));
        }
      })
    ).subscribe(res => {
      if (res.result) {
        if (this.inputmode === 'useScene' || this.inputmode === 'useParam') {
          this.filteredCase = res.data;
        } else if (this.inputmode === 'useSql') {
          this.filteredCase = res.data.items;
        }
      }
    });
  }

  // 组装显示字段
  displayFn(item: FuzzySearchEntity) {
    if (item) { return item.name; }
  }

  // 用例选择
  optionSelected(event: MatAutocompleteSelectedEvent, searchMode: string): void {
    const item = event.option.value;
    if (item && Object.keys(item).length > 0) {
      this.fuzzySelected.emit({
        data: item,
        mode: searchMode
      });
    }
  }

}
