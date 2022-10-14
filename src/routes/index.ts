/* eslint-disable @typescript-eslint/no-explicit-any */
import Dashboard from '~/pages/dashboard';
import { ReactNode } from 'react';
import Motel from '~/pages/motel';
import AddMotel from '~/pages/motel/add-motel/AddMotel';
import EditMotel from '~/pages/motel/edit-motel/EditMotel';
import AddRoom from '~/pages/room/add-room/AddRoom';
import CustomerRedirect from '~/pages/customer';
import ServicePage from '~/pages/service';
import AddEditService from '~/pages/service/AddEditService';
import ListCustomer from '~/pages/motel/list-customer';
import EditRoom from '~/pages/room/edit-room';
import WaterPage from '~/pages/water';
import PowerOnly from '~/pages/data-power';
import Calculate from '~/pages/calculate';
import BookingRoomDeposit from '~/pages/booking';
import AddEditBooking from '~/pages/booking/AddorEditBooking';

export interface Route {
    path: string;
    component: ReactNode | any;
}
const routes: Route[] = [
    { path: '', component: Dashboard },
    { path: '/customer/create', component: CustomerRedirect },
    { path: '/customer/view', component: CustomerRedirect },
    { path: '/customer/edit', component: CustomerRedirect },
    { path: '/motel-room', component: Motel },
    { path: '/motel-room/customer', component: ListCustomer },
    { path: '/motel-room/add-motel', component: AddMotel },
    { path: '/motel-room/edit-motel/:id', component: EditMotel },
    { path: '/motel-room/add-room', component: AddRoom },
    { path: '/motel-room/edit-room/:id', component: EditRoom },
    { path: '/service', component: ServicePage },
    { path: '/data-water', component: WaterPage },
    { path: '/service/add-service', component: AddEditService },
    { path: '/service/edit-service', component: AddEditService },
    { path: '/data-power', component: PowerOnly },
    { path: '/calculator-money', component: Calculate },
    { path: '/booking', component: BookingRoomDeposit },
    { path: '/booking/create', component: AddEditBooking },
    { path: '/booking/edit-booking', component: AddEditBooking },
];

export default routes;
