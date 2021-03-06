import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { Player } from '../shared/player';
import { User } from '../shared/user';

declare var $: any;

@Component({
  selector: 'app-player-management',
  templateUrl: './player-management.component.html',
  styleUrls: ['./player-management.component.scss']
})
export class PlayerManagementComponent implements OnInit {
  @ViewChild('userDialog') userDialog!: ElementRef;
  @ViewChild('playerDialog') playerDialog!: ElementRef;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: ElementRef;
  @ViewChild('errorDialog') errorDialog!: ElementRef;
  @ViewChild('successDialog') successDialog!: ElementRef;
  @ViewChild('logDialog') logDialog!: ElementRef;
  @Input() redirectUri: string = '';

  isInitialized = false;
  user: User = { email: '', nickName: '', publicTwitter: '', publicUrl: '' };
  players: Player[] = [];
  selectedPlayer: Player | null = null;
  isLoading = false;
  isRegistered = false;
  error = '';
  userDialogError = '';
  playerDialogError = '';
  playerError: { title: string, detail: string } | null = null;
  isBusy = false;
  isLogBusy = false;
  log: any[] = [];

  private userLoaded = false;

  constructor(public authService: AuthService, @Inject(DOCUMENT) public document: Document, private http: HttpClient) {
    this.authService.user$.subscribe(
      async (profile) => {
        if (!profile) {
          this.isInitialized = true;
        } else if (profile && !this.userLoaded) {
          this.isInitialized = false;
          this.userLoaded = true;
          this.user.email = profile.email;
          await this.loadUser();
        }
      }
    );
  }

  async ngOnInit() {
  }

  login(): void {
    this.authService.loginWithPopup({ redirect_uri: this.redirectUri });
  }

  logout(): void {
    this.authService.logout({ returnTo: this.redirectUri });
  }

  editUser(): void {
    $(this.userDialog.nativeElement).modal({});
  }

  async register() {
    try {
      this.clearErrorMessage();
      await this.http.post(`${environment.apiEndpoint}/api/users`, this.user).toPromise();
      this.isRegistered = true;
      await this.loadPlayers();
    } catch (error) {
      if (error.error) {
        this.setErrorMessage(error.error.detail);
      } else {
        this.setErrorMessage(error.message);
      }
    }
  }

  async saveUser() {
    try {
      this.clearErrorMessage();
      await this.http.patch(`${environment.apiEndpoint}/api/users/me`, this.user).toPromise();
      $(this.userDialog.nativeElement).modal('hide');
    } catch (error) {
      if (error.error) {
        this.setErrorMessage(error.error.detail, 'userDialog');
      } else {
        this.setErrorMessage(error.message, 'userDialog');
      }
    }
  }

  addPlayer(): void {
    this.selectedPlayer = { name: '', apiKey: '', webApiUrl: '', hasApiKey: false, needsThrottling: false, gitHubUrl: '' };
    $(this.playerDialog.nativeElement).modal({});
  }

  editPlayer(player: Player): void {
    this.playerDialogError = '';
    this.selectedPlayer = Object.assign({}, player);
    $(this.playerDialog.nativeElement).modal({});
  }

  apiKeyChanged() {
    if (this.selectedPlayer) {
      this.selectedPlayer.apiKeyChanged = true;
    }
  }

  confirmDeletePlayer(player: Player): void {
    this.selectedPlayer = player;
    $(this.confirmDeleteDialog.nativeElement).modal({});
  }

  async testPlayer(player: Player) {
    try {
      this.isBusy = true;
      await this.http.get(`${environment.apiEndpoint}/api/players/${player.id}/test`).toPromise();
      $(this.successDialog.nativeElement).modal({});
      this.isBusy = false;
    } catch (error: any) {
      this.playerError = error.error;
      if (this.playerError && this.playerError.title) {
        this.playerError.title = this.playerError.title.replace(/\\n/, '<br/>').replace(/\n/, '<br/>');;
        this.playerError.detail = this.playerError.detail.replace(/\\n/, '<br/>').replace(/\n/, '<br/>');;
      } else {
        this.playerError = { title: 'Error', detail: error.message };
      }

      this.isBusy = false;
      $(this.errorDialog.nativeElement).modal({});
    }
  }

  async runPlayer(player: Player) {
    this.isBusy = true;
    try {
      await this.http.post(`${environment.apiEndpoint}/api/players/${player.id}/play`, {}).toPromise();
      this.isBusy = false;

      this.showLog(player);
    } catch (error: any) {
      this.isBusy = false
    }

    await this.loadPlayers();
  }

  async savePlayer(): Promise<void> {
    this.clearErrorMessage();

    if (this.selectedPlayer) {
      try {
        this.isBusy = true;

        if (!this.selectedPlayer.id) {
          // add player
          await this.http.post(`${environment.apiEndpoint}/api/players`, this.selectedPlayer).toPromise();
        } else {
          // update player
          let player: any = {
            name: this.selectedPlayer.name,
            webApiUrl: this.selectedPlayer.webApiUrl,
            needsThrottling: this.selectedPlayer.needsThrottling,
            gitHubUrl: this.selectedPlayer.gitHubUrl
          };

          if (!this.selectedPlayer.hasApiKey) {
            player.apiKey = '';
          } else if (this.selectedPlayer.apiKeyChanged === true) {
            player.apiKey = this.selectedPlayer.apiKey;
          }

          await this.http.patch(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}`, player).toPromise();
        }

        $(this.playerDialog.nativeElement).modal('hide');
        this.isBusy = false;

        await this.loadPlayers();
      } catch (error: any) {
        this.isBusy = false;
        console.error(error);

        if (error.error && error.error.detail) {
          this.setErrorMessage(error.error.detail, 'playerDialog');
        } else {
          this.setErrorMessage(error.message, 'playerDialog');
        }
      }
    }
  }

  async deletePlayer(): Promise<void> {
    this.isBusy = true;

    if (this.selectedPlayer && this.selectedPlayer.id) {
      try {
        await this.http.delete(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}`).toPromise();
      } catch (error: any) {
      } finally {
        this.isBusy = false;
        $(this.confirmDeleteDialog.nativeElement).modal('hide');
        await this.loadPlayers();
      }

    }
  }

  showLog(player: Player) {
    this.selectedPlayer = player;
    $(this.logDialog.nativeElement).modal({});
    this.refreshLog();
  }

  async refreshLog() {
    if (this.selectedPlayer) {
      try {
        this.isLogBusy = true;
        this.log = (await this.http.get<any>(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}/log`).toPromise());
      } catch (error: any) {
        this.setErrorMessage(error.message);
      } finally {
        this.isLogBusy = false;
      }
    }
  }

  async clearLog() {
    if (this.selectedPlayer) {
      try {
        this.isLogBusy = true;
        (await this.http.post(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}/log/clear`, {}).toPromise());
      } catch (error: any) {
        this.setErrorMessage(error.message);
      } finally {
        this.isLogBusy = false;
      }

      await this.refreshLog();
    }
  }

  async loadPlayers() {
    this.isLoading = true;
    this.players = (await this.http.get<Player[]>(`${environment.apiEndpoint}/api/players`).toPromise()).map((p) => ({
      id: p.id,
      name: p.name,
      webApiUrl: p.webApiUrl,
      apiKey: p.hasApiKey ? '***************' : '',
      hasApiKey: p.hasApiKey,
      lastMeasurement: p.lastMeasurement,
      avgNumberOfShots: p.avgNumberOfShots,
      stdDev: p.stdDev,
      needsThrottling: p.needsThrottling,
      gitHubUrl: p.gitHubUrl
    }))
      .sort((a, b) => a.name < b.name ? -1 : 1);
    this.isLoading = false;
  }

  private async loadUser() {
    try {
      this.user = (await this.http.get<User>(`${environment.apiEndpoint}/api/users/me`).toPromise());
      this.isRegistered = true;
      await this.loadPlayers();
    } catch (error: any) {
      if (error.status !== 404) {
        this.setErrorMessage(error.message);
      }
    }

    this.isInitialized = true;
  }

  private setErrorMessage(message: string, type: null | 'userDialog' | 'playerDialog' = null) {
    if (type === 'userDialog') {
      this.userDialogError = message.replace(/\n/, '<br/>');
    } else if (type === 'playerDialog') {
      this.playerDialogError = message.replace(/\n/, '<br/>');
    } else {
      this.error = message.replace(/\n/, '<br/>');
    }
  }

  private clearErrorMessage() {
    this.error = '';
    this.userDialogError = '';
    this.playerDialogError = '';
  }
}
