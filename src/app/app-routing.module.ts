import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthHelper } from './_helpers/auth.helper';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const serversModule = () => import('./servers/servers.module').then(x => x.ServersModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);
const aboutModule = () => import('./about/about.module').then(x => x.AboutModule);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'servers',
    pathMatch: 'full',
    canActivate: [AuthHelper]
  },
  {
    path: 'account',
    loadChildren: accountModule
  },
  {
    path: 'servers',
    loadChildren: serversModule,
    canActivate: [AuthHelper]
  },
  {
    path: 'users',
    loadChildren: usersModule,
    canActivate: [AuthHelper]
  },
  {
    path: 'about',
    loadChildren: aboutModule
  },
  {
    path: '**',
    redirectTo: 'servers'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  // Nothing to see here...
}
