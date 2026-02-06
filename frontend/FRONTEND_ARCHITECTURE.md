# Frontend Architecture Guide

> **Senior Frontend Engineer - Day 1 UI Structure**

This guide covers the foundational UI structure for a student discussion platform built with Next.js 14 App Router and Tailwind CSS.

---

## 📁 Recommended Folder Structure

```
frontend/src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Home feed
│   ├── popular/
│   │   └── page.tsx            # Popular posts
│   ├── deadlines/
│   │   └── page.tsx            # Deadlines tracker
│   ├── announcements/
│   │   └── page.tsx            # Campus announcements
│   └── login/
│       └── page.tsx            # Auth page
│
├── components/                 # Reusable components
│   ├── layout/                 # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   ├── feed/                   # Feed-related components
│   │   ├── PostCard.tsx
│   │   ├── PostSkeleton.tsx
│   │   └── EmptyFeed.tsx
│   ├── ui/                     # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── common/                 # Shared components
│       ├── SkeletonLoader.tsx
│       └── EmptyState.tsx
│
├── lib/                        # Utilities
│   ├── api.ts                  # API client
│   └── utils.ts                # Helper functions
│
└── styles/
    └── globals.css             # Global styles & design tokens
```

---

## 🎨 Color System (Design Tokens)

Define in `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand Colors */
    --color-primary: 37 99 235;      /* Blue-600 */
    --color-primary-hover: 29 78 216; /* Blue-700 */
    
    /* Backgrounds */
    --color-bg-primary: 255 255 255;   /* White */
    --color-bg-secondary: 249 250 251; /* Gray-50 */
    --color-bg-tertiary: 243 244 246;  /* Gray-100 */
    
    /* Text */
    --color-text-primary: 17 24 39;    /* Gray-900 */
    --color-text-secondary: 107 114 128; /* Gray-500 */
    --color-text-tertiary: 156 163 175; /* Gray-400 */
    
    /* Borders */
    --color-border-light: 229 231 235; /* Gray-200 */
    --color-border-default: 209 213 219; /* Gray-300 */
    
    /* Status Colors */
    --color-success: 34 197 94;        /* Green-500 */
    --color-error: 239 68 68;          /* Red-500 */
    --color-warning: 245 158 11;       /* Amber-500 */
  }
}
```

**Usage:**
```tsx
// Use Tailwind's default classes
<div className="bg-gray-50 text-gray-900 border-gray-200">
```

---

## 🧱 Component Naming Structure

### Naming Convention: `[Domain][ComponentType]`

| Component | File Name | Export |
|-----------|-----------|--------|
| Post card | `PostCard.tsx` | `export default PostCard` |
| Post skeleton | `PostSkeleton.tsx` | `export default PostSkeleton` |
| Empty feed state | `EmptyFeed.tsx` | `export default EmptyFeed` |
| Sidebar layout | `Sidebar.tsx` | `export default Sidebar` |
| Generic button | `Button.tsx` | `export default Button` |

**Rules:**
- Use **PascalCase** for component files
- One component per file
- Default export for primary component
- Named exports for variants

---

## 🏗️ Sidebar Layout Structure

```tsx
// components/layout/Sidebar.tsx
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      {/* Top: Logo */}
      <div className="p-6 border-b">
        <Logo />
      </div>
      
      {/* Middle: Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem href="/" icon="🏠" label="Home" />
        <NavItem href="/popular" icon="🔥" label="Popular" />
        <NavItem href="/deadlines" icon="📅" label="Deadlines" />
        <NavItem href="/announcements" icon="📢" label="Announcements" />
      </nav>
      
      {/* Bottom: User Profile */}
      <div className="p-4 border-t">
        <UserMenu />
      </div>
    </aside>
  );
}
```

**Layout Pattern:**
```
┌──────────────────┐
│   Logo/Brand     │
├──────────────────┤
│                  │
│   Navigation     │
│   - Home         │
│   - Popular      │
│   - Deadlines    │
│   - Announcements│
│                  │
├──────────────────┤
│   User Profile   │
└──────────────────┘
```

---

## 📄 Page Placeholders

### 1. Home (Feed)
```tsx
// app/page.tsx
export default function HomePage() {
  const { posts, loading } = usePosts();
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Your Campus Feed</h1>
      </header>
      
      {loading ? (
        <PostSkeleton count={3} />
      ) : posts.length > 0 ? (
        posts.map(post => <PostCard key={post.id} post={post} />)
      ) : (
        <EmptyFeed />
      )}
    </div>
  );
}
```

### 2. Popular
```tsx
// app/popular/page.tsx
export default function PopularPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Trending Discussions</h1>
        <p className="text-gray-500 mt-2">
          Most active posts across all campuses
        </p>
      </header>
      
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <FilterTab active>Today</FilterTab>
        <FilterTab>This Week</FilterTab>
        <FilterTab>This Month</FilterTab>
      </div>
      
      {/* Popular posts */}
      <PostSkeleton count={5} />
    </div>
  );
}
```

### 3. Deadlines
```tsx
// app/deadlines/page.tsx
export default function DeadlinesPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Assignment Tracker</h1>
        <p className="text-gray-500 mt-2">
          Track your upcoming deadlines
        </p>
      </header>
      
      {/* Calendar view placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-400">📅 Calendar view coming soon</p>
      </div>
    </div>
  );
}
```

### 4. Announcements
```tsx
// app/announcements/page.tsx
export default function AnnouncementsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Campus Announcements</h1>
        <p className="text-gray-500 mt-2">
          Official updates from your university
        </p>
      </header>
      
      <EmptyState 
        icon="📢"
        title="No new announcements"
        description="Check back later for official campus updates"
      />
    </div>
  );
}
```

---

## 🦴 Skeleton Loaders

### Generic Skeleton Component
```tsx
// components/common/SkeletonLoader.tsx
export default function SkeletonLoader({ 
  className = "" 
}: { 
  className?: string 
}) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}
```

### Post Skeleton
```tsx
// components/feed/PostSkeleton.tsx
import SkeletonLoader from '@/components/common/SkeletonLoader';

export default function PostSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {/* Author */}
          <div className="flex items-center space-x-3">
            <SkeletonLoader className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-4 w-32" />
              <SkeletonLoader className="h-3 w-24" />
            </div>
          </div>
          
          {/* Title */}
          <SkeletonLoader className="h-6 w-3/4" />
          
          {/* Content */}
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-5/6" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <SkeletonLoader className="h-6 w-20 rounded-full" />
            <SkeletonLoader className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
```

---

## 🌵 Empty States

### Generic Empty State
```tsx
// components/common/EmptyState.tsx
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon = "📭", 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### Empty State Variants

**Empty Feed:**
```tsx
<EmptyState
  icon="📭"
  title="No posts yet"
  description="Be the first to start a discussion in your campus community"
  action={{
    label: "Create Post",
    onClick: () => router.push('/create')
  }}
/>
```

**No Deadlines:**
```tsx
<EmptyState
  icon="✅"
  title="You're all caught up!"
  description="No upcoming deadlines. Add one to start tracking."
/>
```

**No Announcements:**
```tsx
<EmptyState
  icon="📢"
  title="No announcements"
  description="Check back later for official campus updates"
/>
```

---

## 📦 Component Structure Template

```tsx
// components/[category]/[ComponentName].tsx

import { ReactNode } from 'react';

interface ComponentNameProps {
  // Props with TypeScript types
  children?: ReactNode;
  className?: string;
}

/**
 * Brief description of what this component does
 */
export default function ComponentName({ 
  children,
  className = ""
}: ComponentNameProps) {
  return (
    <div className={`base-classes ${className}`}>
      {children}
    </div>
  );
}
```

---

## 🎯 Day 1 Component Checklist

### Layout Components ✅
- [ ] `Sidebar.tsx` - Navigation sidebar
- [ ] `Header.tsx` - Optional top header
- [ ] `Container.tsx` - Max-width wrapper

### UI Components ✅
- [ ] `SkeletonLoader.tsx` - Generic skeleton
- [ ] `EmptyState.tsx` - Generic empty state
- [ ] `PostCard.tsx` - Post display
- [ ] `PostSkeleton.tsx` - Post loading state

### Pages ✅
- [ ] `/` - Home feed
- [ ] `/popular` - Trending posts
- [ ] `/deadlines` - Assignment tracker
- [ ] `/announcements` - Campus news
- [ ] `/login` - Authentication

---

## 🚦 State Management Pattern

For Day 1, keep it simple:

```tsx
// Use React Query for server state (recommended)
import { useQuery } from '@tanstack/react-query';

function usePosts() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/posts').then(res => res.data)
  });
  
  return { posts: data || [], loading: isLoading };
}
```

**OR use simple useState + useEffect:**
```tsx
function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.get('/posts')
      .then(res => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);
  
  return { posts, loading };
}
```

---

## 🎨 Styling Guidelines

1. **Use Tailwind utility classes** - Avoid custom CSS unless necessary
2. **Responsive design** - Mobile-first approach
   ```tsx
   <div className="p-4 md:p-8 lg:p-12">
   ```
3. **Consistent spacing** - Use Tailwind's spacing scale (4, 6, 8, 12, 16)
4. **Color consistency** - Use defined gray scales
   ```tsx
   bg-gray-50   // Backgrounds
   text-gray-900 // Primary text
   text-gray-500 // Secondary text
   border-gray-200 // Borders
   ```

---

## 📝 Naming Best Practices

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `PostCard`, `EmptyState` |
| **Props Interfaces** | PascalCase + Props | `PostCardProps` |
| **Hooks** | camelCase + use | `usePosts`, `useAuth` |
| **Utilities** | camelCase | `formatDate`, `truncateText` |
| **Constants** | UPPER_SNAKE | `MAX_POST_LENGTH` |

---

## 💡 Quick Tips

1. **Don't over-abstract on Day 1** - Start with simple components, refactor later
2. **Use TypeScript** - Type your props for better DX
3. **Component size** - Keep components under 150 lines; extract if larger
4. **Empty states are important** - Users hate seeing blank pages
5. **Skeleton loaders improve UX** - Always show loading states

---

## 🔧 Next Steps (Day 2+)

- [ ] Add form components (Input, Textarea, Select)
- [ ] Implement post creation modal
- [ ] Add notification system
- [ ] Build user profile component
- [ ] Create comment threads
- [ ] Add search functionality

---

**Remember:** Structure over style on Day 1. Focus on:
- ✅ Clear component organization
- ✅ Proper loading states
- ✅ Helpful empty states
- ❌ NOT pixel-perfect design
