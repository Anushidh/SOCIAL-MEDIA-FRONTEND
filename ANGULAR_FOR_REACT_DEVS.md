# Angular for React Developers

A quick reference guide covering everything you need to work in this project.

---

## The Core Mental Model

| React concept | Angular equivalent |
|---|---|
| Component (function) | Component (class) |
| JSX | HTML template (separate string or file) |
| `useState` | class property |
| `useEffect` | `ngOnInit` / `ngOnDestroy` lifecycle hooks |
| `useContext` / Redux | Service + Dependency Injection |
| `props` | `@Input()` decorator |
| `emit` / callback props | `@Output()` + `EventEmitter` |
| `react-router` | `@angular/router` |
| `axios` / `fetch` | `HttpClient` (returns `Observable`) |
| `useMemo` / `useCallback` | Pipes |
| `React.lazy` | `loadComponent` in routes |

---

## Components

### React vs Angular

```tsx
// React
function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(false);
  return <div onClick={() => setLiked(true)}>{post.content}</div>;
}
```

```ts
// Angular
@Component({
  selector: 'app-post-card',
  standalone: true,
  template: `<div (click)="onLike()">{{ post.content }}</div>`,
})
export class PostCardComponent {
  @Input() post!: Post;        // = props
  @Output() liked = new EventEmitter<Post>(); // = callback prop

  onLike() {
    this.liked.emit(this.post); // = onLike(post)
  }
}
```

**Key differences:**
- Components are **classes**, not functions
- Template is a string (or separate `.html` file) — not JSX
- No `return` statement for the view
- State is just a **class property** — changing it re-renders automatically

---

## Template Syntax Cheat Sheet

```html
<!-- Interpolation (same as JSX {}) -->
{{ user.name }}

<!-- Property binding (like JSX prop={value}) -->
<img [src]="user.avatarUrl">
<button [disabled]="loading">

<!-- Event binding (like JSX onClick={handler}) -->
<button (click)="submitForm()">
<input (keyup.enter)="search()">
<form (ngSubmit)="onSubmit()">

<!-- Two-way binding (no React equivalent — combines [value] + (change)) -->
<input [(ngModel)]="searchQuery">
<!-- Requires FormsModule in imports[] -->

<!-- Conditional rendering (@if = ternary/&&) -->
@if (isLoading) {
  <div class="spinner"></div>
} @else {
  <div>{{ content }}</div>
}

<!-- List rendering (@for = .map()) -->
@for (post of posts; track post.id) {
  <app-post-card [post]="post"/>
}

<!-- Class binding -->
<div [class.active]="isActive">
<div [ngClass]="{ 'bg-red-500': error, 'bg-green-500': success }">

<!-- Style binding -->
<div [style.color]="textColor">
```

---

## Services & Dependency Injection (instead of Context/Redux)

In React you'd use Context or a state management library. Angular uses **Services** — singleton classes that get injected into any component that needs them.

```ts
// src/app/core/services/auth.service.ts
@Injectable({ providedIn: 'root' })  // 'root' = singleton across the whole app
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string) {
    // returns Observable (like a Promise)
    return this.http.post<AuthResponse>('/api/auth/login', { email, password });
  }
}
```

```ts
// Using it in a component — Angular injects it automatically
export class LoginComponent {
  constructor(private authService: AuthService) {}
  //           ^^^^^^ Angular sees this and provides the singleton

  submit() {
    this.authService.login(email, password).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.error(err),
    });
  }
}
```

**Rule:** You never call `new AuthService()`. Angular's DI system creates and provides it.

---

## Observables vs Promises

Angular uses **RxJS Observables** instead of Promises. Think of them as streams.

```ts
// Promise (React/JS style)
const data = await fetch('/api/posts').then(r => r.json());

// Observable (Angular style)
this.http.get('/api/posts').subscribe({
  next: (data) => { this.posts = data; },
  error: (err) => { console.error(err); },
  complete: () => { this.loading = false; },
});
```

**Useful operators** (import from `rxjs/operators`):

```ts
import { tap, map, catchError, switchMap, debounceTime } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

// tap — side effect without changing the value (like .then() but non-mutating)
this.postsService.getPost(id).pipe(
  tap((post) => console.log('Got post:', post))
).subscribe();

// map — transform the value (like Array.map but for streams)
this.postsService.getFeed().pipe(
  map((res) => res.data)
).subscribe((posts) => this.posts = posts);

// BehaviorSubject — like useState but shared across components
private countSubject = new BehaviorSubject<number>(0);
count$ = this.countSubject.asObservable();  // subscribe to this in components
this.countSubject.next(5);                  // update the value (= setState)

// debounceTime — for search inputs (wait before firing)
this.searchSubject.pipe(
  debounceTime(400),        // wait 400ms after last keystroke
  distinctUntilChanged()    // only if value actually changed
).subscribe((query) => this.search(query));
```

**Using Observables in templates (no .subscribe() needed):**
```html
<!-- async pipe handles subscribe/unsubscribe automatically -->
@if ((notifCount$ | async) ?? 0; as count) {
  <span class="badge">{{ count }}</span>
}
```

---

## Routing

```ts
// app.routes.ts
export const routes: Routes = [
  {
    path: 'profile/:username',        // = '/profile/:username' in react-router
    loadComponent: () =>              // = React.lazy()
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent),
  },
  { path: '', redirectTo: '/feed', pathMatch: 'full' },  // = <Navigate to="/feed"/>
  { path: '**', redirectTo: '/feed' },                    // = 404 catch-all
];
```

**In templates:**
```html
<!-- RouterLink = <Link to="/feed"> -->
<a routerLink="/feed">Feed</a>
<a [routerLink]="['/profile', user.username]">Profile</a>

<!-- Active class (= NavLink activeClassName) -->
<a routerLink="/feed" routerLinkActive="bg-primary-50 text-primary-600">Feed</a>
```

**In components:**
```ts
export class ProfileComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,  // = useParams()
    private router: Router,         // = useNavigate()
  ) {}

  ngOnInit() {
    // Read route params
    this.route.params.subscribe(params => {
      const username = params['username'];  // = params.username from useParams()
    });

    // Read query params (?q=hello)
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
    });
  }

  goToFeed() {
    this.router.navigate(['/feed']);         // = navigate('/feed')
    this.router.navigate(['/feed'], {        // = navigate('/feed', { replace: true })
      replaceUrl: true
    });
  }
}
```

---

## HTTP / API Calls

All API calls in this project go through `ApiService`. You never use `fetch` or `axios`.

```ts
// src/app/core/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${baseUrl}${path}`);
  }
  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(`${baseUrl}${path}`, body);
  }
}
```

**Using it in feature services:**
```ts
@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private api: ApiService) {}

  getFeed(page = 1) {
    return this.api.get<PaginatedResponse<Post>>(`/posts/feed?page=${page}`);
  }

  create(data: { content: string }) {
    return this.api.post<Post>('/posts', data);
  }
}
```

**Using it in components:**
```ts
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = false;

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.postsService.getFeed().subscribe({
      next: (res) => {
        this.posts = res.data;    // just assign — no setState() needed
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
```

---

## Auth Interceptor (like Axios interceptors)

The JWT token is automatically attached to every request via the auth interceptor. You don't touch this — it's wired up in `app.config.ts`.

```ts
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
```

---

## Lifecycle Hooks

```ts
export class MyComponent implements OnInit, OnDestroy {

  ngOnInit() {
    // = useEffect(() => {}, [])
    // Runs once after component mounts
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // = useEffect(() => {}, [prop])
    // Runs when @Input() values change
    if (changes['userId']) {
      this.loadUser(changes['userId'].currentValue);
    }
  }

  ngOnDestroy() {
    // = useEffect cleanup function: return () => {}
    // Runs before component unmounts — clean up subscriptions here
    this.subscription.unsubscribe();
  }
}
```

---

## Forms

**Reactive Forms** (used in this project — like controlled components in React):

```ts
export class LoginComponent {
  // Define form structure and validation
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private fb: FormBuilder) {}

  // Access values
  onSubmit() {
    if (this.form.invalid) return;  // = form validation check
    const { email, password } = this.form.value;
  }

  // Access individual control (for error display)
  get emailControl() { return this.form.get('email'); }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email" type="email">

  <!-- Show error -->
  @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
    <p class="error">Email is required</p>
  }

  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
```

---

## Standalone Components & imports[]

Angular 18 uses **standalone components** (no NgModules needed). Each component declares what it needs:

```ts
@Component({
  standalone: true,
  imports: [
    CommonModule,       // *ngIf, *ngFor, async pipe, etc.  ← always include
    RouterLink,         // <a routerLink="...">
    RouterLinkActive,   // routerLinkActive="..."
    ReactiveFormsModule, // formGroup, formControlName
    FormsModule,        // [(ngModel)]
    AvatarComponent,    // your own components go here too
    TimeAgoPipe,        // your pipes
  ],
  template: `...`
})
export class MyComponent {}
```

**The `CommonModule` gotcha:** If `@if` or `| async` isn't working, you're missing `CommonModule` in `imports[]`.

---

## Pipes (like filters / utility functions in templates)

```html
<!-- Built-in pipes -->
{{ user.name | uppercase }}           <!-- "JOHN DOE" -->
{{ post.createdAt | date:'short' }}   <!-- "1/3/26, 3:22 PM" -->
{{ price | currency:'USD' }}          <!-- "$9.99" -->

<!-- Custom pipe (TimeAgoPipe in this project) -->
{{ post.createdAt | timeAgo }}        <!-- "2h" or "3d" -->

<!-- async pipe — unwraps Observable/Promise in template -->
{{ notifCount$ | async }}
```

**Creating a pipe:**
```ts
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    // ...
    return '2h';
  }
}
```

---

## @Input and @Output (Props & Events)

```ts
// Parent component template
<app-post-card
  [post]="myPost"              // pass data in    = <PostCard post={myPost}
  (liked)="onLiked($event)"   // listen for event = onLiked={handleLike}
/>

// Child component class
export class PostCardComponent {
  @Input() post!: Post;                       // required input
  @Input() showActions: boolean = true;       // optional with default
  @Output() liked = new EventEmitter<Post>(); // emits a Post object

  handleLike() {
    this.liked.emit(this.post);  // triggers (liked) in the parent
  }
}
```

---

## Signals (Angular 17+ — like useState but simpler)

Used in this project for the toast service:

```ts
// Service
toasts = signal<Toast[]>([]);    // = useState<Toast[]>([])

// Update
this.toasts.update(t => [...t, newToast]);  // = setToasts(prev => [...prev, newToast])
this.toasts.set([]);                         // = setToasts([])

// Read in template
@for (toast of toastService.toasts(); track toast.id) { ... }
//                                 ^^ call it like a function
```

---

## Project-Specific Patterns

### Making an API call in a component
```ts
export class SomeComponent implements OnInit {
  data: MyType[] = [];

  constructor(private myService: MyService) {}

  ngOnInit() {
    this.myService.getData().subscribe({
      next: (res) => this.data = res.data,
      error: () => this.toast.error('Failed to load'),
    });
  }
}
```

### Showing a toast
```ts
constructor(private toast: ToastService) {}

this.toast.success('Post created!');
this.toast.error('Something went wrong');
this.toast.info('Link copied');
```

### Navigating programmatically
```ts
constructor(private router: Router) {}

this.router.navigate(['/feed']);
this.router.navigate(['/profile', username]);
```

### Getting the current logged-in user
```ts
constructor(private authService: AuthService) {}

const user = this.authService.currentUser;    // synchronous snapshot
this.authService.currentUser$.subscribe(u => ...); // reactive stream
```

---

## File Structure in This Project

```
src/app/
├── core/
│   ├── guards/        → authGuard (= ProtectedRoute in React)
│   ├── interceptors/  → authInterceptor (= axios interceptor)
│   ├── models/        → TypeScript interfaces (= TypeScript types in React)
│   └── services/      → API calls + shared state (= Context + custom hooks)
├── shared/
│   ├── components/    → reusable UI components (PostCard, Avatar, etc.)
│   └── pipes/         → template helpers (TimeAgo, etc.)
├── features/          → page-level components (one folder per route)
│   ├── feed/
│   ├── profile/
│   ├── auth/
│   └── ...
├── layouts/           → shell/wrapper components (sidebar + nav)
├── app.component.ts   → root component (just <router-outlet/>)
├── app.routes.ts      → all route definitions
└── app.config.ts      → providers setup (like main.tsx in React)
```
