import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import * as signalR from '@aspnet/signalr';
import { CacheService } from './cache.service';
import { JwtService } from './jwt.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection: signalR.HubConnection;
    private isConnected = false;

    constructor(
        private cacheService: CacheService,
        private jwtService: JwtService
    ) { }

    /**
     * Initialize SignalR connection
     */
    startConnection(): void {
        if (this.isConnected) return;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/signalr`, {
                accessTokenFactory: () => this.jwtService.getToken()
            })
            .build();

        this.hubConnection
            .start()
            .then(() => {
                console.log('SignalR Connection started');
                this.isConnected = true;
                this.registerEvents();
            })
            .catch(err => console.error('Error while establishing signalr connection: ' + err));
    }

    /**
     * Register events to listen for
     */
    private registerEvents(): void {
        // Listen for generic global messages
        this.hubConnection.on('sendToAll', (message: string) => {
            this.handleMessage(message);
        });

        // Listen for specific cache update event if backend supports it
        this.hubConnection.on('UpdateCache', (entityName: string) => {
            this.cacheService.clearByEntity(entityName);
        });
    }

    /**
     * Handle incoming messages
     */
    private handleMessage(message: string): void {
        // Case 1: Legacy format "refresh-..."
        if (message && message.startsWith('refresh-')) {
            switch (message) {
                case 'refresh-account-list': this.cacheService.clearByEntity(CacheConstants.ACCOUNT_LIST); break;
                case 'refresh-branch': this.cacheService.clearByEntity(CacheConstants.BRANCH); break;
                case 'refresh-customer': this.cacheService.clearByEntity(CacheConstants.CUSTOMER); break;
                case 'refresh-customer-locations': this.cacheService.clearByEntity(CacheConstants.CUSTOMER_LOCATIONS); break;
                case 'refresh-customer-normal-routes': this.cacheService.clearByEntity(CacheConstants.CUSTOMER_NORMAL_ROUTES); break;
                case 'refresh-customer-routes': this.cacheService.clearByEntity(CacheConstants.CUSTOMER_ROUTES); break;
                case 'refresh-customer-toll-routes': this.cacheService.clearByEntity(CacheConstants.CUSTOMER_TOLL_ROUTES); break;
                case 'refresh-department': this.cacheService.clearByEntity(CacheConstants.DEPARTMENT); break;
                case 'refresh-district': this.cacheService.clearByEntity(CacheConstants.DISTRICT); break;
                case 'refresh-employee': this.cacheService.clearByEntity(CacheConstants.EMPLOYEE); break;
                case 'refresh-fee': this.cacheService.clearByEntity(CacheConstants.FEE); break;
                case 'refresh-group-fee': this.cacheService.clearByEntity(CacheConstants.GROUP_FEE); break;
                case 'refresh-handling-group': this.cacheService.clearByEntity(CacheConstants.HANDLING_GROUP); break;
                case 'refresh-other-category': this.cacheService.clearByEntity(CacheConstants.OTHER_CATEGORIES); break;
                case 'refresh-payment-fee-group': this.cacheService.clearByEntity(CacheConstants.PAYMENT_FEE_GROUP); break;
                case 'refresh-province': this.cacheService.clearByEntity(CacheConstants.PROVINCE); break;
                case 'refresh-revenue-fee-group': this.cacheService.clearByEntity(CacheConstants.REVENUE_FEE_GROUP); break;
                case 'refresh-route': this.cacheService.clearByEntity(CacheConstants.ROUTE); break;
                case 'refresh-supplier': this.cacheService.clearByEntity(CacheConstants.SUPPLIER); break;
                case 'refresh-supplier-drivers': this.cacheService.clearByEntity(CacheConstants.SUPPLIER); break;
                case 'refresh-supplier-vehicles': this.cacheService.clearByEntity(CacheConstants.SUPPLIER); break;
                case 'refresh-ticket-prices': this.cacheService.clearByEntity(CacheConstants.TICKET_PRICES); break;
                case 'refresh-title': this.cacheService.clearByEntity(CacheConstants.TITLE); break;
                case 'refresh-toll-locations': this.cacheService.clearByEntity(CacheConstants.TOLL_LOCATIONS); break;
                case 'refresh-toll-route': this.cacheService.clearByEntity(CacheConstants.TOLL_ROUTE); break;
                case 'refresh-toll-station': this.cacheService.clearByEntity(CacheConstants.TOLL_STATION); break;
                case 'refresh-transit-ports': this.cacheService.clearByEntity(CacheConstants.TRANSIT_PORTS); break;
                case 'refresh-transport-category': this.cacheService.clearByEntity(CacheConstants.TRANSPORT_CATEGORY); break;
                case 'refresh-vehicle-oil-quota': this.cacheService.clearByEntity(CacheConstants.VEHICLE_OIL_QUOTA); break;
                case 'refresh-vehicle': this.cacheService.clearByEntity(CacheConstants.VEHICLE); break;
                default: console.warn('Unknown legacy signal:', message); break;
            }
        }

        // Case 2: New standardized protocol "Update:EntityName"
        else if (message && message.startsWith('Update:')) {
            const entityName = message.split(':')[1];
            if (entityName) {
                this.cacheService.clearByEntity(entityName);
            }
        }
    }

    /**
     * Notify other clients about an update
     * This sends a message to the hub, which should broadcast it to 'sendToAll'
     */
    notifyUpdate(entityName: string): void {
        if (!this.isConnected) return;

        // Call the dedicated UpdateCache method on the backend
        this.hubConnection.invoke('UpdateCache', entityName)
            .catch(err => console.error('Error sending update notification: ', err));
    }
}
