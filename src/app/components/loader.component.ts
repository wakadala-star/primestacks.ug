import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'loader-component',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  ngOnInit() {
    console.log('Loader initialized');
  }
}
