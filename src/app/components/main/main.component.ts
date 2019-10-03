import { Component, OnInit } from '@angular/core';
import { FestivalService } from 'src/app/service/festival.service';
import { MusicFestival } from 'src/app/interfaces/musicfestival';
import { Band } from 'src/app/interfaces/band';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  festivals: MusicFestival[] = [];
  recordLabels = new Map<string, Map<string, Set<string>>>();

  constructor(private festivalService: FestivalService) { }

  ngOnInit() {
    this.festivalService.getFestivals().subscribe((data: MusicFestival[]) => {
      console.log(data);
      this.festivals = data;
    }, (error) => {
      console.log('Unable to fetch festivals, using local response');
      this.fetchLocal();
      });
  }

  fetchLocal() {
    this.festivalService.getFestivalsLocal().subscribe((data: MusicFestival[]) => {
      this.festivals = data;
      this.sort();
    });
  }

  /**
   * Task convert from
   * Festival -> Band, Label to
   * Label -> Band -> Festival
   * Sort alphabetically the Label, Band and Festival
   * RecordLabel and Festival could be missing
   */
  sort() {
    this.festivals.forEach((festival: MusicFestival) => {
      console.log('Festival: ' + festival.name);
      const bands: Band[] = festival.bands;
      bands.forEach(band => {
        console.log('Band: ' + band.name);
        this.setUpRecordLabels(band, festival.name);
      });
    });
    console.log(this.recordLabels);
  }

  setUpRecordLabels(band: Band, festival: string) {
    const label = (band.recordLabel) ? band.recordLabel : 'No label';
    const validFestival = festival ? true : false;
    // if there exists recordlabel
    // if there exists a band
    // add festival to set
    // if there is no band
    // add new <band, set<festival>>
    const labelMap = this.recordLabels.get(label);
    // recordlabel exists
    if (labelMap !== undefined) {
      if (labelMap.get(band.name) !== undefined) {
        if (validFestival) {
          labelMap.get(band.name).add(festival);
        }
      } else {
        const set = new Set<string>();
        if (validFestival) {
          set.add(festival);
        }
        labelMap.set(band.name, set);
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
  // TODO: Fix CORS issue - proxy backend
  // TODO: sort Festivals
  // TODO: tests
}
