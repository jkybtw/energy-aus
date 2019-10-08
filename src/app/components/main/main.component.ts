import { Component, OnInit } from '@angular/core';
import { FestivalService } from 'src/app/service/festival.service';
import { MusicFestival } from 'src/app/interfaces/musicfestival';
import { Band } from 'src/app/interfaces/band';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
  /**
   * Task convert from
   * Festival -> Band, Label to
   * Label -> Band -> Festival
   * Sort alphabetically the Label, Band and Festival
   * RecordLabel and Festival could be missing
   */
export class MainComponent implements OnInit {

  festivals: MusicFestival[] = [];
  recordLabels = new Map<string, Map<string, Set<string>>>();
  loaded = false;
  jsonSource = 'Loading';
  selectedSource = 'auto';
  constructor(private festivalService: FestivalService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadFestivals();
  }

  loadFestivals() {
    this.loaded = false;
    this.festivalService.getFestivals().subscribe((data: MusicFestival[]) => {
      console.log('Fetching festival data from online API');
      this.festivals = data;
      this.parseFestivals();
      this.sortRecordlabels();
      this.loaded = true;
      this.jsonSource = 'Online';
      this.openSnackBar();
    }, (error) => {
      console.log('Unable to fetch festivals, using local response');
      this.fetchLocal();
      });
  }

  fetchLocal() {
    this.loaded = false;
    this.festivalService.getFestivalsLocal().subscribe((data: MusicFestival[]) => {
      this.festivals = data;
      this.parseFestivals();
      this.sortRecordlabels();
      this.loaded = true;
      this.jsonSource = 'Local';
      this.openSnackBar();
    });
  }

  onRefreshClick() {
    if (this.selectedSource === 'auto') {
      console.log('auto');
      this.loadFestivals();
    } else {
      console.log('local');
      this.fetchLocal();
    }
  }

  parseFestivals() {
    this.recordLabels.clear();
    if (this.festivals.length === 0) {
       return;
    }
    this.festivals.forEach((festival: MusicFestival) => {
      const bands: Band[] = festival.bands;
      bands.forEach(band => {
        this.setUpRecordLabels(band, festival.name);
      });
    });
  }

  setUpRecordLabels(band: Band, festival: string) {
    const label = band.recordLabel ? band.recordLabel : 'No label';
    const validFestival = festival ? true : false;
    const bandMap = this.recordLabels.get(label);

    if (bandMap !== undefined) {
      if (bandMap.get(band.name) !== undefined) {
        if (validFestival) {
          bandMap.get(band.name).add(festival);
        }
      } else {
        const set = new Set<string>();
        if (validFestival) {
          set.add(festival);
        }
        bandMap.set(band.name, set);
      }
    } else {
      const map = new Map<string, Set<string>>();
      const set = new Set<string>();
      if (validFestival) {
        set.add(festival);
      }
      map.set(band.name, set);
      this.recordLabels.set(label, map);
    }
  }

  sortRecordlabels() {
    this.recordLabels.forEach((bands: Map<string, Set<string>>, label: string, record: Map<string, Map<string, Set<string>>>) => {
      bands.forEach((festivals: Set<string>, band: string, map: Map<string, Set<string>>) => {
        map.set(band, this.sortSet(festivals));
      });
    });
  }

  // TODO: tests
  sortSet(set: Set<string>) {
    return new Set([...set].sort());
  }

  openSnackBar() {
    this.snackBar.open('Data source: ' + this.jsonSource, 'Close', {
      duration: 10000,
    });
  }
}
