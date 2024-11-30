import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { EditComponent } from './pages/edit/edit.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ShowImagesPageComponent } from './pages/show-images-page/show-images-page.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LegalDocumentsComponent } from './pages/legal-documents/legal-documents.component';
import { InfoCollectionComponent } from './components/info-collection/info-collection.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsServiceComponent } from './components/terms-service/terms-service.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from "./auth.guard";

export const routes: Routes = [
  {path:"", component: LandingComponent},
  {path:"login", component: LoginComponent},
  {path:"gallery", component: GalleryPageComponent},
  {path:"signup", component: SignupComponent},
  {path:"my-images/edit", component: EditComponent, canActivate: [AuthGuard]},
  {path:"images/:id", component: ShowImagesPageComponent},
  {path:"profile", component: ProfilePageComponent, canActivate: [AuthGuard]},
  {path:"administration", component: DashboardComponent, canActivate: [AuthGuard]},
  {
    path: 'privacy-policy',
    component: LegalDocumentsComponent,
    children: [{ path: '', component: PrivacyPolicyComponent }]
  },
  {
    path: 'terms-of-service',
    component: LegalDocumentsComponent,
    children: [{ path: '', component: TermsServiceComponent }]
  },
  {
    path: 'information-collection-notice',
    component: LegalDocumentsComponent,
    children: [{ path: '', component: InfoCollectionComponent }]
  }
];
