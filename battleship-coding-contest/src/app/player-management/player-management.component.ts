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

  private userLoaded = false;

  constructor(public authService: AuthService, @Inject(DOCUMENT) public document: Document, private http: HttpClient) {
    this.authService.user$.subscribe(
      (profile) => {
        console.warn('auth service', profile);
        if (!profile) {
          this.isInitialized = true;
        } else if (profile && !this.userLoaded) {
          this.isInitialized = false;
          this.userLoaded = true;
          this.user.email = profile.email;
          this.loadUser();
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
    this.selectedPlayer = { name: '', apiKey: '', webApiUrl: '' };
    $(this.playerDialog.nativeElement).modal({});
  }

  editPlayer(player: Player): void {
    this.selectedPlayer = Object.assign({}, player);
    $(this.playerDialog.nativeElement).modal({});
  }

  confirmDeletePlayer(player: Player): void {
    this.selectedPlayer = player;
    $(this.confirmDeleteDialog.nativeElement).modal({});
  }

  async testPlayer(player: Player) {
    try {
      await this.http.get(`${environment.apiEndpoint}/api/players/${player.id}/test`).toPromise();
    } catch (error: any) {
      console.warn(error);
    }
  }

  async runPlayer(player: Player) {
    // TODO: run player
    await this.loadPlayers();
  }

  async savePlayer(): Promise<void> {
    this.clearErrorMessage();

    if (this.selectedPlayer) {
      try {
        if (!this.selectedPlayer.id) {
          // add player
          await this.http.post(`${environment.apiEndpoint}/api/players`, this.selectedPlayer).toPromise();
        } else {
          // update player
          await this.http.patch(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}`, this.selectedPlayer).toPromise();
        }

        $(this.playerDialog.nativeElement).modal('hide');
        await this.loadPlayers();
      } catch (error: any) {
        if (error.error) {
          this.setErrorMessage(error.error.detail, 'playerDialog');
        } else {
          this.setErrorMessage(error.message, 'playerDialog');
        }
      }
    }
  }

  async deletePlayer(): Promise<void> {
    if (this.selectedPlayer && this.selectedPlayer.id) {
      await this.http.delete(`${environment.apiEndpoint}/api/players/${this.selectedPlayer.id}`).toPromise();
      $(this.confirmDeleteDialog.nativeElement).modal('hide');
      await this.loadPlayers();
    }
  }

  private async loadUser() {
    try {
      this.user = (await this.http.get<User>(`${environment.apiEndpoint}/api/users/me`).toPromise());
      this.isRegistered = true;
      //this.user.email = profile.email;
      await this.loadPlayers();
    } catch (error: any) {
      if (error.status !== 404) {
        this.setErrorMessage(error.message);
      }
    }

    this.isInitialized = true;
  }

  private async loadPlayers() {
    this.isLoading = true;
    this.players = (await this.http.get<Player[]>(`${environment.apiEndpoint}/api/players`).toPromise())
      .sort((a, b) => a.name < b.name ? -1 : 1);
    this.isLoading = false;
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
