import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { PlayerManagementComponent } from './player-management/player-management.component';
import { RankingComponent } from './ranking/ranking.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerManagementComponent,
    RankingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AuthModule.forRoot({
      // The domain and clientId were configured in the previous chapter
      domain: 'coding-club-linz.eu.auth0.com',
      clientId: 'nP5FdyKVreP7dVT9Di3GmMWGM2hylX7D',

      // Request this audience at user authentication time
      audience: 'https://coding-pirates.coderdojo.net/management',

      // Request this scope at user authentication time
      scope: 'read:current_user',

      // Specify configuration for the interceptor              
      httpInterceptor: {
        allowedList: [
          {
            // Match any request that starts 'https://coding-club-linz.eu.auth0.com/api/v2/' (note the asterisk)
            //uri: environment.apiEndpoint + '/api/*',
            uriMatcher: (uri) => {
              return uri.startsWith(environment.apiEndpoint + '/api/') && !uri.startsWith(environment.apiEndpoint + '/api/results');
            },
            tokenOptions: {
              // The attached token should target this audience
              audience: 'https://coding-pirates.coderdojo.net/management',

              // The attached token should have these scopes
              scope: 'read:current_user'
            }
          }
        ]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  //bootstrap: [AppComponent],
  entryComponents: [PlayerManagementComponent, RankingComponent]
})
export class AppModule {
  constructor(private injector: Injector) {

  }

  ngDoBootstrap() {
    const playerManagement = createCustomElement<PlayerManagementComponent>(
      PlayerManagementComponent,
      { injector: this.injector }
    );

    customElements.define('battleship-player-management', playerManagement);

    const ranking = createCustomElement<RankingComponent>(
      RankingComponent,
      { injector: this.injector }
    );

    customElements.define('battleship-ranking', ranking);
  }
}
