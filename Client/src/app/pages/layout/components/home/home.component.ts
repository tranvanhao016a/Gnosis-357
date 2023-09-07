import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiBooleanHandler } from '@taiga-ui/cdk';
import { Observable, Subscription, combineLatest, interval } from 'rxjs';
import { AuthState } from 'src/app/ngrx/states/auth.state';
import { ProfileState } from 'src/app/ngrx/states/profile.state';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { Router } from '@angular/router';
import * as ProfileActions from 'src/app/ngrx/actions/profile.actions';
import { UserState } from 'src/app/ngrx/states/user.state';
import { Course } from 'src/app/models/course.model';
import { Profile } from 'src/app/models/profile.model';
import { UserInfo } from 'src/app/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy, OnInit {
  private timerSubscription: Subscription | undefined;
  currentTime: string = '';

  getDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}<br><br>${hour}:${minute}:${second}`;
  }

  updateCurrentTime() {
    this.currentTime = this.getDateTime();
    this.cdr.detectChanges();
  }

  search = '';
  open = false;

  readonly testForm = new FormGroup({
    testValue: new FormControl(''),
  });
  readonly courses_state = ['Chưa học', 'Đang học', 'Đã học xong'];

  idToken$: Observable<string> = this.store.select('auth', 'idToken');
  profile$: Observable<Profile> = this.store.select('profile', 'profile');
  user$: Observable<UserInfo> = this.store.select('user', 'user');

  state: string | undefined = '';
  onRadioChange(selectedState: string) {
    this.state = selectedState;
    console.log(this.state);
  }

  subscriptions: Subscription[] = [];
  courses: Course[] = [];
  ongoingCourses: Course[] = [];
  completedCourses: Course[] = [];

  homeForm = new FormGroup({
    id: new FormControl('', Validators.required),
    avatar: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    displayName: new FormControl('', Validators.required),
    userName: new FormControl('', Validators.required),
    courses: new FormArray([], Validators.required),
    ongoingCourses: new FormArray([], Validators.required),
    completedCourses: new FormArray([], Validators.required),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store<{
      profile: ProfileState;
      auth: AuthState;
      user: UserState;
    }>
  ) {}

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.subscriptions.forEach((val) => {
      val.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.updateCurrentTime();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateCurrentTime();
    });
    this.subscriptions.push(
      this.store.select('profile', 'profile').subscribe((val) => {
        if (val != null && val != undefined) {
          this.homeForm.controls.avatar.setValue(val.avatar);
          this.homeForm.controls.id.setValue(val.id);
          this.homeForm.controls.email.setValue(val.email);
          this.homeForm.controls.displayName.setValue(val.displayName);
          this.homeForm.controls.userName.setValue(val.userName);
        }
      }),
      this.profile$.subscribe((profile) => {
        if (profile != null && profile != undefined) {
          this.courses = profile.courses || [];
          this.ongoingCourses = profile.ongoingCourses || [];
          this.completedCourses = profile.completedCourses || [];
          console.log('profile: ', profile);
        }
      }),

      combineLatest({
        idToken: this.idToken$,
        user: this.user$,
        profile: this.profile$,
      }).subscribe((res) => {
        if (
          res.user != undefined &&
          res.idToken != undefined &&
          res.user != null &&
          res.idToken != null &&
          res.idToken != '' &&
          (res.profile == null || res.profile == undefined)
        ) {
          this.store.dispatch(
            ProfileActions.get({ id: res.user.uid, idToken: res.idToken })
          );
        }
      })
    );
  }

  toEdit() {
    this.router.navigate(['/base/profile']);
  }

  toBuy() {
    this.router.navigate(['base/browse']);
  }

  toCourse(course: Course) {
    this.router.navigate(['base/course', course._id]);
  }
}
