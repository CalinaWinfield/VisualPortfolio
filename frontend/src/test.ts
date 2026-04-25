import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: any;

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Explicitly import spec files so tests run under Karma webpack in this environment.
import './app/services/supabase.service.spec';
import './app/components/signUp/signUp.component.spec';
import './app/components/about/about.component.spec';
import './app/components/index/index.component.spec';
import './app/components/index-header/index-header.component.spec';
import './app/components/header/header.component.spec';
import './app/components/footer/footer.component.spec';
import './app/components/create-item/items-list.component.spec';
import './app/components/create-item/create-item.component.spec';
import './app/components/document/document.component.spec';
import './app/components/dashboard/dashboard.component.spec';
import './app/components/guide/guide.component.spec';
