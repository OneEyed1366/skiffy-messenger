# React Compiler

React Compiler is a new build-time tool that automatically optimizes your React app to improve its performance, particularly on updates (re-renders). The compiler is designed to work with existing JavaScript (and TypeScript) and understands the [Rules of React](https://react.dev/reference/rules). If your app follows those rules you generally won't need to rewrite any code to use it. We've been testing the compiler at Meta and it's already powering a few production surfaces like instagram.com.

In order to optimize applications, React Compiler automatically memoizes your code. You may be familiar today with memoization through APIs such as `useMemo`, `useCallback`, and `React.memo`. With these APIs you can tell React that certain parts of your application don't need to recompute if their inputs haven't changed, reducing work on updates. While powerful, it's easy to forget to apply memoization or apply them incorrectly. This can lead to inefficient updates as React has to check parts of your UI that don't have any _meaningful_ changes.

The compiler uses its knowledge of JavaScript and the Rules of React to automatically memoize values or groups of values within your components and hooks. If it detects breakages of the rules, it will automatically skip over just those components or hooks, and continue safely compiling other code.

If your codebase is already very well-memoized, you might not expect to see major performance improvements with the compiler. However, in practice memoizing the correct dependencies that cause performance issues is tricky to get right by hand.

While the compiler is mostly decoupled from Babel, it is currently the primary integration we support for the short-term. Most of the popular React frameworks do have Babel support as fallbacks and so React Compiler can still be used with them. Please refer to [the docs for an installation guide](https://react.dev/learn/react-compiler#installation). We are looking into other integrations as well and will share more when we have made progress.

## What does the compiler do?

It's helpful to first understand the main use cases of memoization in React today:

1. **Skipping cascading re-rendering of components (perf)**
   - Re-rendering `<Parent />` causes many components in its component tree to re-render, even though only `<Parent />` has changed

2. **Skipping expensive calculations from outside of React (perf)**
   - For example, calling `expensivelyProcessAReallyLargeArrayOfObjects()` inside of your component or hook that needs that data

3. **Memoizing deps to effects**
   - To ensure that a dependency of a hook is still `===` on re-rendering so as to prevent an infinite loop in a hook such as `useEffect()`

The initial release of React Compiler is primarily focused on **improving update performance** (i.e., re-rendering existing components), so it primarily focuses on the first two use cases.

### Optimizing Re-renders

React lets developers express their UI as a function of their current state (more concretely: their props, state, and context). In its current implementation, when a component's state changes, React will re-render that component _and all of its children_ — unless the developer has applied some form of manual memoization with `useMemo()`, `useCallback()`, or `React.memo()`. For example, in the following example, `<MessageButton>` will re-render whenever `<FriendList>`'s state changes:

```js
function FriendList({ friends }) {
  const onlineCount = useFriendOnlineCount();
  if (friends.length === 0) {
    return <NoFriends />;
  }
  return (
    <div>
      <span>{onlineCount} online</span>
      {friends.map((friend) => (
        <FriendListCard key={friend.id} friend={friend} />
      ))}
      <MessageButton />
    </div>
  );
}
```

[_See this example in the React Compiler Playground_](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEAYjHgpgCYAyeYOAFMEWuZVWEQL4CURwADrEicQgyKEANnkwIAwtEw4iAXiJQwCMhWoB5TDLmKsTXgG5hRInjRFGbXZwB0UygHMcACzWr1ABn4hEWsYBBxYYgAeADkIHQ4uAHoAPksRbisiMIiYYkYs6yiqPAA3FMLrIiiwAAcAQ0wU4GlZBSUcbklDNqikusaKkKrgR0TnAFt62sYHdmp+VRT7SqrqhOo6Bnl6mCoiAGsEAE9VUfmqZzwqLrHqM7ubolTVol5eTOGigFkEMDB6u4EAAhKA4HCEZ5DNZ9ErlLIWYTcEDcIA)

React Compiler automatically applies the equivalent of manual memoization, ensuring that only the relevant parts of an app re-render as state changes, which is sometimes referred to as "fine-grained reactivity". In the above example, React Compiler determines that the return value of `<FriendListCard />` can be reused even as `friends` changes, and can avoid recreating this JSX _and_ avoid re-rendering `<MessageButton>` as the count changes.

### Expensive calculations also get memoized

The compiler can also automatically memoize for the second use case:

```js
// **Not** memoized by React Compiler, since this is not a component or hook
function expensivelyProcessAReallyLargeArrayOfObjects() {
  /* ... */
}

// Memoized by React Compiler since this is a component
function TableContainer({ items }) {
  // This function call would be memoized:
  const data = expensivelyProcessAReallyLargeArrayOfObjects(items);
  // ...
}
```

However, if `expensivelyProcessAReallyLargeArrayOfObjects` is truly an expensive function, you may want to consider implementing its own memoization outside of React, because:

- React Compiler only memoizes React components and hooks, not every function
- React Compiler's memoization is not shared across multiple components or hooks

So if `expensivelyProcessAReallyLargeArrayOfObjects` was used in many different components, even if the same exact items were passed down, that expensive calculation would be run repeatedly. We recommend [profiling](https://react.dev/reference/react/useMemo#how-to-tell-if-a-calculation-is-expensive) first to see if it really is that expensive before making code more complicated.

### Still an open area of research: Memoization for effects

One open issue that we've seen in real-world apps is that the compiler can sometimes memoize differently from how the code was originally memoized. Typically, this is good because the compiler can memoize more granularly than can be done manually. For example, the compiler memoizes using low-level primitives, not via `useMemo`, so it doesn't need to follow the Rules of Hooks when it comes to generating memoized code while it can still memoize hook calls safely.

However, this can cause problems when something that was memoized in a certain way before is no longer memoized exactly the same. The most common example of this is effects — `useEffect`, `useLayoutEffect`, etc. —  that rely on dependencies not changing in order to prevent an infinite loop or under/over-firing. If you notice any unexpected behavior from effects in your app while trying out the compiler, please [file an issue](https://github.com/facebook/react/issues).

This is still an open area of research for the React team on the best way to solve this problem. Currently, the compiler will statically validate that auto-memoization matches up with any existing manual memoization. If it can't prove that they're the same, the component or hook is safely skipped over.

For this reason, we recommend keeping any existing `useMemo()` or `useCallback()` calls to ensure that you don't change effect behavior. React Compiler will still attempt to produce _more_ optimal memoization code, but will skip compiling if it can't preserve the original memoization behavior. Instead of removing `useMemo`/`useCallback`, we recommend writing new code without relying on `useMemo` and `useCallback` at all.

## What does the compiler assume?

React Compiler assumes that your code:

1. Is valid, semantic JavaScript
2. Tests that nullable/optional values and properties are defined before accessing them (for example, by enabling [`strictNullChecks`](https://www.typescriptlang.org/tsconfig/#strictNullChecks) if using TypeScript), i.e., `if (object.nullableProperty) { object.nullableProperty.foo }` or with optional-chaining `object.nullableProperty?.foo`
3. Follows the [Rules of React](https://react.dev/reference/rules)

React Compiler can verify many of the Rules of React statically, and will skip compilation when it detects an error. To see the errors we recommend also installing [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler).

### The compiler found errors in my code!

Please see #8 for a guide on how to successfully rollout the compiler in your codebase.

## What can the compiler "see"?

Currently, React Compiler operates on a single file at a time, meaning that it only uses the information inside of a single file in order to perform its optimizations. While this may at first glance seem limited, in practice we've found that because of React's programming model of using plain JavaScript values and compiler-friendly conventions and rules, this approach works surprisingly well. Of course, there are tradeoffs like not being able to use information from another file, which would allow even more fine-grained memoization. But the current single file approach balances the complexity of the compiler against output quality, and our results show it's a good tradeoff so far.

While the compiler does not currently use type information from typed JavaScript languages like TypeScript or Flow, internally it has its own type system that helps it understand your code better.

[1] A compiler term that means an expression which is a part of a larger expression. For example `useState(makeInitialState())` is made up of 2 expressions: the CallExpression `useState(...)` and CallExpression `makeInitialState`. The nested CallExpression is a sub-expression of the CallExpression.

## Incremental Adoption

React Compiler can be adopted incrementally, allowing you to try it on specific parts of your codebase first. This guide shows you how to gradually roll out the compiler in existing projects.

## You will learn

Why incremental adoption is recommended
Using Babel overrides for directory-based adoption
Using the “use memo” directive for opt-in compilation
Using the “use no memo” directive to exclude components
Runtime feature flags with gating
Monitoring your adoption progress
Why Incremental Adoption?
React Compiler is designed to optimize your entire codebase automatically, but you don’t have to adopt it all at once. Incremental adoption gives you control over the rollout process, letting you test the compiler on small parts of your app before expanding to the rest.

Starting small helps you build confidence in the compiler’s optimizations. You can verify that your app behaves correctly with compiled code, measure performance improvements, and identify any edge cases specific to your codebase. This approach is especially valuable for production applications where stability is critical.

Incremental adoption also makes it easier to address any Rules of React violations the compiler might find. Instead of fixing violations across your entire codebase at once, you can tackle them systematically as you expand compiler coverage. This keeps the migration manageable and reduces the risk of introducing bugs.

By controlling which parts of your code get compiled, you can also run A/B tests to measure the real-world impact of the compiler’s optimizations. This data helps you make informed decisions about full adoption and demonstrates the value to your team.

## Approaches to Incremental Adoption

There are three main approaches to adopt React Compiler incrementally:

### Babel overrides - Apply the compiler to specific directories

### Opt-in with “use memo” - Only compile components that explicitly opt in

### Runtime gating - Control compilation with feature flags

### All approaches allow you to test the compiler on specific parts of your application before full rollout.

### Directory-Based Adoption with Babel Overrides

Babel’s overrides option lets you apply different plugins to different parts of your codebase. This is ideal for gradually adopting React Compiler directory by directory.

### Basic Configuration

Start by applying the compiler to a specific directory:

```js
// babel.config.js
module.exports = {
  plugins: [
    // Global plugins that apply to all files
  ],
  overrides: [
    {
      test: "./src/modern/**/*.{js,jsx,ts,tsx}",
      plugins: ["babel-plugin-react-compiler"],
    },
  ],
};
```

### Expanding Coverage

As you gain confidence, add more directories:

```js
// babel.config.js
module.exports = {
  plugins: [
    // Global plugins
  ],
  overrides: [
    {
      test: [
        "./src/modern/**/*.{js,jsx,ts,tsx}",
        "./src/features/**/*.{js,jsx,ts,tsx}",
      ],
      plugins: ["babel-plugin-react-compiler"],
    },
    {
      test: "./src/legacy/**/*.{js,jsx,ts,tsx}",
      plugins: [
        // Different plugins for legacy code
      ],
    },
  ],
};
```

### With Compiler Options

You can also configure compiler options per override:

```js
// babel.config.js
module.exports = {
  plugins: [],
  overrides: [
    {
      test: "./src/experimental/**/*.{js,jsx,ts,tsx}",
      plugins: [
        [
          "babel-plugin-react-compiler",
          {
            // options ...
          },
        ],
      ],
    },
    {
      test: "./src/production/**/*.{js,jsx,ts,tsx}",
      plugins: [
        [
          "babel-plugin-react-compiler",
          {
            // options ...
          },
        ],
      ],
    },
  ],
};
```

### Opt-in Mode with “use memo”

For maximum control, you can use compilationMode: 'annotation' to only compile components and hooks that explicitly opt in with the "use memo" directive.

### Note

This approach gives you fine-grained control over individual components and hooks. It’s useful when you want to test the compiler on specific components without affecting entire directories.

### Annotation Mode Configuration

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      "babel-plugin-react-compiler",
      {
        compilationMode: "annotation",
      },
    ],
  ],
};
```

### Using the Directive

Add "use memo" at the beginning of functions you want to compile:

```js
function TodoList({ todos }) {
  "use memo"; // Opt this component into compilation

  const sortedTodos = todos.slice().sort();

  return (
    <ul>
      {sortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function useSortedData(data) {
  "use memo"; // Opt this hook into compilation

  return data.slice().sort();
}
```

With `compilationMode: 'annotation'`, you must:

- Add "use memo" to every component you want optimized
- Add "use memo" to every custom hook
- Remember to add it to new components
  This gives you precise control over which components are compiled while you evaluate the compiler’s impact.

## Runtime Feature Flags with Gating

The gating option enables you to control compilation at runtime using feature flags. This is useful for running A/B tests or gradually rolling out the compiler based on user segments.

### How Gating Works

The compiler wraps optimized code in a runtime check. If the gate returns true, the optimized version runs. Otherwise, the original code runs.

### Gating Configuration

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      "babel-plugin-react-compiler",
      {
        gating: {
          source: "ReactCompilerFeatureFlags",
          importSpecifierName: "isCompilerEnabled",
        },
      },
    ],
  ],
};
```

### Implementing the Feature Flag

Create a module that exports your gating function:

```js
// ReactCompilerFeatureFlags.js
export function isCompilerEnabled() {
  // Use your feature flag system
  return getFeatureFlag("react-compiler-enabled");
}
```

### Troubleshooting Adoption

If you encounter issues during adoption:

- Use "use no memo" to temporarily exclude problematic components
- Check the debugging guide for common issues
- Fix Rules of React violations identified by the ESLint plugin
- Consider using `compilationMode: 'annotation'` for more gradual adoption

## Examples

### React 19 Integration

React Compiler can be integrated with React 19, though it requires manual setup. Here's a complete example:

#### Project Setup

Use Vite for this example as it currently sets up with React 19.2.0:

```bash
pnpm create vite r19-with-compiler --template react
```

#### Creating a Test Example

Replace the App component with this implementation to demonstrate optimization:

```js
import { useState } from "react";

function Header() {
  console.log("Header", Math.random());
  return (
    <header>
      <h1>React Counter</h1>
    </header>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </>
  );
}
```

In an un-optimized React component, the Header will re-render every time App re-renders when clicking the increment button.

#### Installing and Configuring React Compiler

First, install the React Compiler:

```bash
pnpm add babel-plugin-react-compiler
```

Then configure the Babel plugin in your Vite config:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const ReactCompilerConfig = {
  runtimeModule: "@/mycache",
};

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
  ],
});
```

#### Custom Cache Implementation

The React Compiler uses a memoization hook called `c`. Since `react-compiler-runtime` may have dependencies on specific React versions, you can create your own implementation:

```js
// src/mycache.js
import { useState } from "react";

export function c(size) {
  return useState(() => new Array(size))[0];
}
```

#### Alternative Package.json Configuration

You can also trick the package manager into treating your local implementation as the runtime:

```json
{
  "dependencies": {
    "react-compiler-runtime": "file:./src/mycache"
  }
}
```

With this approach, you can remove the `runtimeModule` key from the `ReactCompilerConfig`.

#### How the Cache Implementation Works

The `c` function creates a pre-allocated array using `useState`. The compiler uses this array to store memoized values:

```js
import { useState } from "react";

export function c(size) {
  return useState(() => new Array(size))[0];
}
```

When React Compiler processes a component like:

```js
export default function Hello() {
  return <div className="foo">Hi There</div>;
}
```

It transforms it into optimized code that uses the cache:

```js
import { c as _c } from "/src/mycache.js";

export default function Hello() {
  const $ = _c(2);
  if ($[0] !== "a49bfc30998b8cb2...") {
    for (let $i = 0; $i < 2; $i += 1) {
      $[$i] = Symbol.for("react.memo_cache_sentinel");
    }
    $[0] = "a49bfc30998b8cb2...";
  }
  let t0;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = jsxDEV(
      "div",
      {
        className: "foo",
        children: "Hi There",
      },
      void 0,
      false,
      {},
      this,
    );
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}
```

You can see at the top that the compiled code brings in that c hook and then uses it in the optimized component. The compiler knows that it only needs two slots to hold, in the first slot, the initialized flag, and in second slot the memoized version of the jsx that has the DOM tree.

So now that we know how the c hook is used we can understand a little more about why our implementation works.

First, we are memoizing stuff, and we should not be triggering re-renders of the component just by memoizing stuff. So that’s why we are not calling the state setter function. Because that would force a re-render.

Second, we are relying on the fact that we are getting a reference to the array from new Array (and thus from useState) and we can mutate the data in that array by just setting the array elements. And those mutations will be retained because the useState is holding a reference to the array and not the array contents.

If that second part is baking your noodle then I recommend this video on JavaScript memory management and how references work in relation to arrays and objects and all that.

### Official Polyfill

If you are really interested in putting this into practice then check out the original source for the c function. As well as the working group article. In addition to these instructions you can also follow the official polyfill.

### Going Deeper

If you want a deeper dive into the React Compiler and how all the memoization works be sure to watch my React Compiler video.

This video goes deep into the mechanics of the memoization so that you can really understand how your React component code gets converted and memoized and the granularity of that memoization.

### Important Considerations

Just because you can do something doesn’t mean you should do something. That really applies in this case. The React Compiler is really designed to work within the ecosystem of React 19. So even if you can use it with 19 today, that doesn’t mean it will work tomorrow. Suffice to say, use at your own risk. As the guy says in The Hunt For Red October, “Possible, but not recommended.”

# React 17 vs React 19: Complete Migration Guide

This section provides comprehensive before/after examples showing the migration from React 17 to React 19, covering all major changes including React Compiler optimizations, new hooks, and API improvements.

> **Key Insight:** React Compiler automatically memoizes components, but doesn't solve all performance problems. Real-world tests show effectiveness in only ~20% of cases.

## Table of Contents

1. [Automatic Memoization with React Compiler](#automatic-memoization-with-react-compiler)
2. [Form Handling with useActionState](#form-handling-with-useactionstate)
3. [Ref Callbacks with Cleanup](#ref-callbacks-with-cleanup)
4. [PropTypes and defaultProps Migration](#proptypes-and-defaultprops-migration)
5. [Working with Promises: use() Hook](#working-with-promises-use-hook)
6. [Ref as Props: No More forwardRef](#ref-as-props-no-more-forwardref)
7. [Context without Provider](#context-without-provider)
8. [Instant UI with useOptimistic](#instant-ui-with-useoptimistic)
9. [Form Status with useFormStatus](#form-status-with-useformstatus)
10. [Document Metadata - Built-in SEO](#document-metadata---built-in-seo)
11. [Async Transitions with useTransition](#async-transitions-with-usetransition)
12. [Critical Insights and Best Practices](#critical-insights-and-best-practices)

## Automatic Memoization with React Compiler

### Example 1: Slow Component with Props

_Before: Manual memoization required for performance_

**До React Compiler (React 17):**

```javascript
const VerySlowComponentMemo = React.memo(VerySlowComponent);

const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Manual memoization required
  const onSubmit = useCallback(() => {}, []);
  const data = useMemo(() => [{ id: "bla" }], []);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>toggle dialog</button>
      <VerySlowComponentMemo onSubmit={onSubmit} data={data} />
    </div>
  );
};
```

_After: React Compiler handles memoization automatically_

```javascript
// Compiler automatically memoizes everything
const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // No longer need useMemo and useCallback
  const onSubmit = () => {};
  const data = [{ id: "bla" }];

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>toggle dialog</button>
      <VerySlowComponent onSubmit={onSubmit} data={data} />
    </div>
  );
};
```

### Example 2: Children as Props

_Before: Manual memoization of children required_

**React 17:**

```javascript
const VerySlowComponentMemo = React.memo(VerySlowComponent);

const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Need to memoize children through useMemo
  const child = useMemo(() => <SomeOtherComponent />, []);

  return <VerySlowComponentMemo>{child}</VerySlowComponentMemo>;
};
```

**React 19:**

```javascript
// Compiler handles children automatically
const SimpleCase = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <VerySlowComponent>
      <SomeOtherComponent />
    </VerySlowComponent>
  );
};
```

### Example 3: React Query Mutations (Critical Case)

**Issue:** React Compiler doesn't handle `useMutation` from React Query correctly by default.

_Problematic (React 17 approach):_

```javascript
const Countries = () => {
  const deleteCountryMutation = useMutation({...});

  // This does NOT work - compiler doesn't memoize correctly
  const onDelete = (name) => {
    deleteCountryMutation.mutate(name);
  };

  return (
    <Button onClick={() => onDelete(name)}>Delete</Button>
  );
};
```

_Fixed (React 19 with proper destructuring):_

```javascript
const Countries = () => {
  // Extract mutate directly
  const { mutate: deleteCountry } = useMutation({...});

  // Now compiler memoizes correctly
  const onDelete = (name) => {
    deleteCountry(name);
  };

  return (
    <Button onClick={() => onDelete(name)}>Delete</Button>
  );
};
```

## Form Handling with useActionState

The new `useActionState` hook replaces complex form state management patterns.

### Example 1: Newsletter Subscription Form

**React 17:**

```javascript
const NewsletterSubscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email) {
      setResult({
        type: "error",
        message: "Please fill in your name and email.",
      });
      return;
    }

    setIsPending(true);
    fakeSendEmail().then(() => {
      setResult({
        type: "success",
        message: "Successfully subscribed!",
      });
      setName("");
      setEmail("");
      setIsPending(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Subscribe</button>
    </form>
  );
};
```

**После (React 19):**

```javascript
const NewsletterSubscribe = () => {
  const [result, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get("email");
      const name = formData.get("name");

      if (!name || !email) {
        return {
          type: "error",
          message: "Please fill in your name and email.",
        };
      }

      await fakeSendEmail();

      return {
        type: "success",
        message: "Successfully subscribed!",
      };
    },
    null,
  );

  // Неконтролируемые инпуты, автоматическая очистка
  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <button type="submit">Subscribe</button>
    </form>
  );
};
```

**What disappeared:** `e.preventDefault()`, controlled inputs, 4 `useState` calls, manual form cleanup, manual `isPending` management.

## Ref Callbacks with Cleanup

React 19 introduces automatic cleanup for ref callbacks, eliminating the need for `useEffect` in many DOM manipulation scenarios.

### Example 1: Event Listeners with Cleanup

**React 17:**

```javascript
function ScrollTracker() {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const handleScroll = () => {
      console.log("Scrolling...");
    };

    scrollRef.current.addEventListener("scroll", handleScroll);

    return () => {
      scrollRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ overflow: "scroll", height: "100px" }}>
      <div style={{ height: "300px" }}>Scroll Me</div>
    </div>
  );
}
```

**React 19:**

```javascript
function ScrollTracker() {
  const refCallback = (node) => {
    if (!node) return;

    const handleScroll = () => {
      console.log("Scrolling...");
    };

    node.addEventListener("scroll", handleScroll);

    // Cleanup automatically called on unmount
    return () => {
      node.removeEventListener("scroll", handleScroll);
      console.log("Removed scroll listener");
    };
  };

  return (
    <div ref={refCallback} style={{ overflow: "scroll", height: "100px" }}>
      <div style={{ height: "300px" }}>Scroll Me</div>
    </div>
  );
}
```

**Advantage:** Ref callback returns a cleanup function that React calls automatically. We eliminate `useEffect` and get direct DOM access.

## PropTypes and defaultProps Migration

React 19 removes support for `propTypes` and `defaultProps` on functional components.

### Example: Component Props Definition

**React 17:**

```javascript
import PropTypes from "prop-types";

function Heading({ text }) {
  return <h1>{text}</h1>;
}

Heading.propTypes = {
  text: PropTypes.string,
};

Heading.defaultProps = {
  text: "Hello, world!",
};
```

**React 19:**

```javascript
interface Props {
  text?: string;
}

function Heading({text = 'Hello, world!'}: Props) {
  return <h1>{text}</h1>;
}
```

**Reason:** `propTypes` and `defaultProps` for functional components are removed. Use TypeScript or ES6 default parameters instead.

## Critical Insights: React Compiler Limitations

React Compiler is **not a silver bullet**. On real projects (150k lines of code) it fixed only **2 out of 10** cases of unnecessary re-renders.

**What's required:**

- Extract `mutate` from React Query directly
- Use proper `key` values (not `index`)
- Extract dynamic lists into separate components
- **Know memoization better than before**

## Working with Promises: use() Hook

**Critical:** `use()` is **not a replacement** for `useEffect`. It only works inside `Suspense` and requires ErrorBoundary for error handling.

### Example 1: Data Fetching

**React 17:**

```javascript
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <ProductList products={products} />;
}
```

**После (React 19):**

```javascript
import { use, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Promise created OUTSIDE component
const productsPromise = fetch("/api/products").then((res) => res.json());

function Products() {
  // use() suspends render until resolve
  const products = use(productsPromise);

  return <ProductList products={products} />;
}

function App() {
  return (
    <ErrorBoundary fallback={<p>Error loading products</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <Products />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**What disappeared:** 3 `useState` calls, entire `useEffect`, manual `loading`/`error` handling, double render (empty state → data).

**Gotcha:** If you create a promise **inside** a component, it will be recreated on every render = infinite loop. Promise must be stable.

## Ref as Props: No More forwardRef

React 19 treats `ref` as a regular prop, eliminating the need for `forwardRef`.

### Example: Component with Ref

**React 17:**

```javascript
import { forwardRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  return (
    <label>
      {props.label}
      <input ref={ref} />
    </label>
  );
});

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput label="Enter your name:" ref={inputRef} />
      <button onClick={handleClick}>Focus input</button>
    </>
  );
}
```

**После (React 19):**

```javascript
// ref теперь обычный проп
function MyInput({ label, ref }) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput label="Enter your name:" ref={inputRef} />
      <button onClick={handleClick}>Focus input</button>
    </>
  );
}
```

**What disappeared:** `forwardRef` wrapper, magical second argument. `ref` is now just another prop, like `className` or `onClick`.

**TypeScript:** `ref` type is inferred automatically, but can be specified explicitly:

```typescript
interface InputProps {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
}
```

## Context without Provider

React 19 allows rendering Context directly without the `.Provider` suffix.

### Example: Theme Context

**React 17:**

```javascript
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div className={`theme-${theme}`}>Content</div>;
}
```

**React 19:**

```javascript
import { createContext, use } from "react";

const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("dark");

  // Render Context directly, without .Provider
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}

function Page() {
  // use() instead of useContext - works in if/for
  const theme = use(ThemeContext);
  return <div className={`theme-${theme}`}>Content</div>;
}
```

**What disappeared:** `.Provider` suffix, `useContext` limitation (doesn't work in conditions).

**Advantage of `use()`:** Can be called conditionally:

```javascript
function ConditionalTheme({ showTheme }) {
  if (showTheme) {
    const theme = use(ThemeContext); // This is valid!
    return <p>Current theme: {theme}</p>;
  }
  return null;
}
```

## Instant UI with useOptimistic

**Problem:** When a user clicks "Like", the UI should update **instantly** without waiting for the server. If the server fails, rollback the changes.

### Example: Optimistic Like Button

**React 17:**

```javascript
function Post({ post }) {
  const [likes, setLikes] = useState(post.likes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleLike() {
    const previousLikes = likes;

    // Optimistic update
    setLikes(likes + 1);
    setPending(true);

    try {
      await fetch(`/api/like/${post.id}`, { method: "POST" });
      setPending(false);
    } catch (err) {
      // Rollback on error
      setLikes(previousLikes);
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div>
      <p>Likes: {likes}</p>
      <button onClick={handleLike} disabled={pending}>
        {pending ? "Liking..." : "Like"}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

**React 19:**

```javascript
import { useOptimistic, useState } from "react";

function Post({ post }) {
  const [likes, setLikes] = useState(post.likes);
  const [error, setError] = useState(null);

  // optimisticLikes automatically rolls back on error
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);

  const pending = likes !== optimisticLikes;

  async function handleLike() {
    setError(null);

    // Instant UI update
    setOptimisticLikes(optimisticLikes + 1);

    try {
      const newLikes = await fetch(`/api/like/${post.id}`, {
        method: "POST",
      }).then((r) => r.json());

      setLikes(newLikes);
    } catch (err) {
      setError(err.message);
      // Rollback happens automatically
    }
  }

  return (
    <div>
      <p>Likes: {optimisticLikes}</p>
      <button onClick={handleLike} disabled={pending}>
        {pending ? "Liking..." : "Like"}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

**What disappeared:** Manual saving of `previousLikes`, explicit rollback `setLikes(previousLikes)`, separate `pending` state.

## Form Status with useFormStatus

The `useFormStatus` hook eliminates the need to pass form state as props to child components.

### Example: Form with Submit Button

**React 17:**

```javascript
function Form() {
  const [pending, setPending] = useState(false);
  const [username, setUsername] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);

    await submitToServer({ username });

    setPending(false);
    setUsername("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      {/* Pass pending to button */}
      <SubmitButton pending={pending} />
    </form>
  );
}

function SubmitButton({ pending }) {
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}
```

**React 19:**

```javascript
import { useFormStatus } from "react-dom";

function Form() {
  async function handleSubmit(formData) {
    const username = formData.get("username");
    await submitToServer({ username });
  }

  return (
    <form action={handleSubmit}>
      <input name="username" />
      {/* Button gets status automatically */}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  // Magic: status is taken from parent form
  const { pending, data } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? `Submitting ${data?.get("username")}...` : "Submit"}
    </button>
  );
}
```

**What disappeared:** `pending` prop, controlled input, `e.preventDefault()`, manual form cleanup.

**Limitation:** `useFormStatus()` works **only** inside child components of `<form>`. In the component with `<form>` itself, it will return `pending: false`.

## Critical Insights and Best Practices

### use() Hook - Not a Silver Bullet

- Requires `Suspense` + `ErrorBoundary` for every promise
- Promises must be stable (not recreated on every render)
- For dynamic queries with parameters, React Query is still preferred

### forwardRef Removal - Logical Decision

- `ref` as a prop is a logical solution
- Less magic, more predictability
- Legacy libraries with `forwardRef` will continue to work through codemods

### useOptimistic - For UX, Not Everything

- Perfect for likes, adding comments, checkboxes
- **Not suitable** for critical operations (payments, account deletion)
- Requires idempotent operations on the backend

### useFormStatus - Saves Props

- Excellent for reusable buttons
- Doesn't work if called in the same component where `<form>` is defined
- Alternative: `useActionState` for full control

## Migration Strategy

Migrating from React 17 to 19 isn't just "update the version and you're done." You need to rethink the architecture of forms, promises, and memoization. Half of the new API solves real problems, the other half creates new constraints that need to be understood.

## Document Metadata - Built-in SEO

**Critical:** React Helmet has been abandoned since 2020 and has security vulnerabilities. React 19 adds native support for `<title>`, `<meta>`, `<link>` directly in components.

### Example 1: Basic SEO

**React 17 + React Helmet:**

```javascript
import { Helmet } from "react-helmet";

function ProductPage({ product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} - MyShop</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={product.keywords} />
        <link rel="canonical" href={`https://myshop.com/${product.id}`} />
      </Helmet>

      <div className="product">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}
```

**React 19:**

```javascript
// No imports, no wrapper components
function ProductPage({ product }) {
  return (
    <div className="product">
      <title>{product.name} - MyShop</title>
      <meta name="description" content={product.description} />
      <meta name="keywords" content={product.keywords} />
      <link rel="canonical" href={`https://myshop.com/${product.id}`} />

      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

**What disappeared:** React Helmet import (900 KB), wrapper `<Helmet>`, memory leak risk.

### Example 2: Dynamic Open Graph Tags

**React 17:**

```javascript
import { Helmet } from "react-helmet";

function BlogPost({ post }) {
  return (
    <>
      <Helmet>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <article>
        <h1>{post.title}</h1>
        <img src={post.coverImage} alt={post.title} />
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

**React 19:**

```javascript
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.coverImage} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />

      <h1>{post.title}</h1>
      <img src={post.coverImage} alt={post.title} />
      <p>{post.content}</p>
    </article>
  );
}
```

### Example 3: Preload/Prefetch Resources

**React 17:**

```javascript
import { Helmet } from "react-helmet";

function DashboardPage() {
  return (
    <>
      <Helmet>
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="prefetch" href="/api/analytics" />
        <link rel="dns-prefetch" href="https://cdn.example.com" />
      </Helmet>

      <Dashboard />
    </>
  );
}
```

**React 19:**

```javascript
function DashboardPage() {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/inter.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link rel="prefetch" href="/api/analytics" />
      <link rel="dns-prefetch" href="https://cdn.example.com" />

      <Dashboard />
    </>
  );
}
```

## Async Transitions with useTransition

**Critical:** React 19's `useTransition` **now supports async functions**. Previously, complex workarounds were required.

### Example 1: API Calls Without Blocking UI

**React 17:**

```javascript
function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value) {
    setLoading(true);

    try {
      const response = await fetch(`/api/users?q=${value}`);
      const data = await response.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    // Проблема: каждый символ триггерит запрос
    handleSearch(value);
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {loading && <p>Loading...</p>}
      {/* UI blocks during request */}
      <ul>
        {results.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**React 19:**

```javascript
function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value); // Instant input update

    // Request doesn't block UI
    startTransition(async () => {
      const response = await fetch(`/api/users?q=${value}`);
      const data = await response.json();
      setResults(data);
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Searching...</p>}
      {/* Can continue typing */}
      <ul>
        {results.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**What changed:** Input updates **instantly**, request runs in background. If typing fast — UI doesn't freeze.

### Example 2: Heavy Computations

**React 17:**

```javascript
function FilteredList({ items }) {
  const [filter, setFilter] = useState("");
  const [filtered, setFiltered] = useState(items);

  function handleFilter(value) {
    setFilter(value);

    // UI freezes for ~500ms
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFiltered(result);
  }

  return (
    <div>
      <input value={filter} onChange={(e) => handleFilter(e.target.value)} />
      {/* 10,000 elements */}
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**React 19:**

```javascript
function FilteredList({ items }) {
  const [filter, setFilter] = useState("");
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleFilter(value) {
    setFilter(value); // Urgent — input updates immediately

    startTransition(() => {
      // Non-urgent — filtering doesn't block
      const result = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFiltered(result);
    });
  }

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => handleFilter(e.target.value)}
        style={{ opacity: isPending ? 0.5 : 1 }}
      />
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 3: Optimistic Profile Updates

**React 17:**

```javascript
function ProfileForm({ user }) {
  const [formData, setFormData] = useState(user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [optimistic, setOptimistic] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Show optimistic state
    setOptimistic("Profile updated!");

    try {
      await fetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } catch (err) {
      setError(err.message);
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button disabled={saving}>Save</button>
      {optimistic && <p>{optimistic}</p>}
      {error && <p>Error: {error}</p>}
    </form>
  );
}
```

**React 19:**

```javascript
function ProfileForm({ user }) {
  const [formData, setFormData] = useState(user);
  const [status, setStatus] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();

    // Instant feedback
    setOptimisticStatus("Profile updated!");

    startTransition(async () => {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setStatus("Saved successfully!");
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      } finally {
        setOptimisticStatus("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button disabled={isPending}>Save</button>
      {optimisticStatus || status}
    </form>
  );
}
```

**Advantage:** User sees "Profile updated!" **instantly**, UI doesn't block during saving.

---

## Additional Examples for Shown Cases

### React Compiler — More Examples

**Example 4: Context with Functions in Value**

**Before:**

```javascript
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Recreated on every render
  const value = useMemo(
    () => ({
      user,
      login: (data) => setUser(data),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

**After:**

```javascript
function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Compiler memoizes object
  const value = {
    user,
    login: (data) => setUser(data),
    logout: () => setUser(null),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

**Example 5: Dependency on ref.current**

**Before (NOT working):**

```javascript
function VideoPlayer() {
  const videoRef = useRef();

  // Compiler does NOT memoize correctly
  const handlePlay = () => {
    videoRef.current?.play();
  };

  return (
    <>
      <video ref={videoRef} />
      <button onClick={handlePlay}>Play</button>
    </>
  );
}
```

**After (correct):**

```javascript
function VideoPlayer() {
  const videoRef = useRef();

  // Используй ref callback для правильной мемоизации
  const refCallback = (node) => {
    if (!node) return;
    videoRef.current = node;
  };

  const handlePlay = () => {
    videoRef.current?.play();
  };

  return (
    <>
      <video ref={refCallback} />
      <button onClick={handlePlay}>Play</button>
    </>
  );
}
```

### useActionState — еще примеры

**Example 2: Multi-field Validation**

**Before:**

```javascript
function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors = {};
    if (username.length < 3) newErrors.username = "Too short";
    if (!email.includes("@")) newErrors.email = "Invalid email";
    if (password.length < 8) newErrors.password = "Too weak";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    await register({ username, email, password });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      {errors.username && <span>{errors.username}</span>}

      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <span>{errors.email}</span>}

      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      {errors.password && <span>{errors.password}</span>}

      <button disabled={loading}>Register</button>
    </form>
  );
}
```

**After:**

```javascript
function RegisterForm() {
  const [state, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const username = formData.get("username");
      const email = formData.get("email");
      const password = formData.get("password");

      const errors = {};
      if (username.length < 3) errors.username = "Too short";
      if (!email.includes("@")) errors.email = "Invalid email";
      if (password.length < 8) errors.password = "Too weak";

      if (Object.keys(errors).length > 0) {
        return { errors };
      }

      await register({ username, email, password });
      return { success: true };
    },
    { errors: {} },
  );

  return (
    <form action={submitAction}>
      <input name="username" />
      {state.errors.username && <span>{state.errors.username}</span>}

      <input name="email" />
      {state.errors.email && <span>{state.errors.email}</span>}

      <input name="password" type="password" />
      {state.errors.password && <span>{state.errors.password}</span>}

      <button disabled={isPending}>Register</button>
    </form>
  );
}
```

**Example 3: Multi-step Form**

**Before:**

```javascript
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleNext(stepData) {
    if (step === 3) {
      setLoading(true);
      await submitForm({ ...data, ...stepData });
      setLoading(false);
    } else {
      setData({ ...data, ...stepData });
      setStep(step + 1);
    }
  }

  return (
    <div>
      {step === 1 && <Step1 onNext={(d) => handleNext(d)} />}
      {step === 2 && <Step2 onNext={(d) => handleNext(d)} />}
      {step === 3 && <Step3 onNext={(d) => handleNext(d)} loading={loading} />}
    </div>
  );
}
```

**After:**

```javascript
function MultiStepForm() {
  const [state, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const step = prevState.step;
      const data = { ...prevState.data };

      // Собираем данные текущего шага
      formData.forEach((value, key) => {
        data[key] = value;
      });

      if (step === 3) {
        await submitForm(data);
        return { step: 4, data, success: true };
      }

      return { step: step + 1, data };
    },
    { step: 1, data: {} },
  );

  return (
    <form action={submitAction}>
      {state.step === 1 && <Step1Fields />}
      {state.step === 2 && <Step2Fields />}
      {state.step === 3 && <Step3Fields />}
      {state.step === 4 && <p>Success!</p>}

      <button disabled={isPending}>
        {state.step === 3 ? "Submit" : "Next"}
      </button>
    </form>
  );
}
```

### Ref Callbacks — еще примеры

**Example 2: Intersection Observer**

**Before:**

```javascript
function LazyImage({ src }) {
  const imgRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={imgRef}>{isVisible && <img src={src} />}</div>;
}
```

**After:**

```javascript
function LazyImage({ src }) {
  const [isVisible, setIsVisible] = useState(false);

  const refCallback = (node) => {
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(node);

    // Cleanup автоматически
    return () => observer.disconnect();
  };

  return <div ref={refCallback}>{isVisible && <img src={src} />}</div>;
}
```

**Example 3: Resize Observer с debounce**

**Before:**

```javascript
function ResponsiveComponent() {
  const divRef = useRef();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let timeout;

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWidth(entries[0].contentRect.width);
      }, 100);
    });

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return <div ref={divRef}>Width: {width}px</div>;
}
```

**After:**

```javascript
function ResponsiveComponent() {
  const [width, setWidth] = useState(0);

  const refCallback = (node) => {
    if (!node) return;

    let timeout;

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWidth(entries[0].contentRect.width);
      }, 100);
    });

    observer.observe(node);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  };

  return <div ref={refCallback}>Width: {width}px</div>;
}
```

### use() с промисами — еще примеры

**Example 2: Conditional Loading**

**Before:**

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <p>Select a user</p>;
  if (loading) return <p>Loading...</p>;

  return <div>{user?.name}</div>;
}
```

**After:**

```javascript
import { use, Suspense } from "react";

function UserProfile({ userId }) {
  if (!userId) return <p>Select a user</p>;

  // Создаем промис динамически
  const userPromise = fetch(`/api/users/${userId}`).then((r) => r.json());
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

function App() {
  const [userId, setUserId] = useState(null);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProfile userId={userId} />
    </Suspense>
  );
}
```

**Example 3: Parallel Requests**

**Before:**

```javascript
function Dashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user").then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json()),
    ]).then(([userData, postsData]) => {
      setUser(userData);
      setPosts(postsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <PostsList posts={posts} />
    </div>
  );
}
```

**After:**

```javascript
const userPromise = fetch("/api/user").then((r) => r.json());
const postsPromise = fetch("/api/posts").then((r) => r.json());

function Dashboard() {
  // Оба запроса идут параллельно
  const user = use(userPromise);
  const posts = use(postsPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <PostsList posts={posts} />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Dashboard />
    </Suspense>
  );
}
```

### forwardRef — еще примеры

**Example 2: Composition with Multiple Refs**

**Before:**

```javascript
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const internalRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => internalRef.current.focus(),
    clear: () => {
      internalRef.current.value = "";
    },
  }));

  return <input ref={internalRef} {...props} />;
});
```

**After:**

```javascript
function FancyInput({ ref, ...props }) {
  const internalRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => internalRef.current.focus(),
    clear: () => {
      internalRef.current.value = "";
    },
  }));

  return <input ref={internalRef} {...props} />;
}
```

**Example 3: HOC с ref**

**Before:**

```javascript
function withLogging(Component) {
  return forwardRef(function WithLogging(props, ref) {
    useEffect(() => {
      console.log("Component mounted");
    }, []);

    return <Component ref={ref} {...props} />;
  });
}
```

**After:**

```javascript
function withLogging(Component) {
  return function WithLogging({ ref, ...props }) {
    useEffect(() => {
      console.log("Component mounted");
    }, []);

    return <Component ref={ref} {...props} />;
  };
}
```

### useOptimistic — еще примеры

**Example 2: List Item Removal**

**Before:**

```javascript
function TodoList({ todos: initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [deleting, setDeleting] = useState(new Set());

  async function handleDelete(id) {
    setDeleting((prev) => new Set(prev).add(id));

    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t.id !== id));
    } catch {
      // Откат
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} style={{ opacity: deleting.has(todo.id) ? 0.5 : 1 }}>
          {todo.text}
          <button onClick={() => handleDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

**After:**

```javascript
function TodoList({ todos: initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [optimisticTodos, deleteOptimistic] = useOptimistic(
    todos,
    (state, deletedId) => state.filter((t) => t.id !== deletedId),
  );

  async function handleDelete(id) {
    deleteOptimistic(id); // Мгновенное удаление

    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t.id !== id));
    } catch {
      // Автоматический откат
    }
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => handleDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

**Example 3: Checkbox Toggling**

**Before:**

```javascript
function Settings({ settings: initial }) {
  const [settings, setSettings] = useState(initial);
  const [pending, setPending] = useState({});

  async function toggleSetting(key) {
    const oldValue = settings[key];

    setPending((prev) => ({ ...prev, [key]: true }));
    setSettings({ ...settings, [key]: !oldValue });

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: !oldValue }),
      });
    } catch {
      setSettings({ ...settings, [key]: oldValue });
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }));
    }
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.notifications}
          disabled={pending.notifications}
          onChange={() => toggleSetting("notifications")}
        />
        Notifications
      </label>
    </div>
  );
}
```

**After:**

```javascript
function Settings({ settings: initial }) {
  const [settings, setSettings] = useState(initial);
  const [optimisticSettings, toggleOptimistic] = useOptimistic(
    settings,
    (state, key) => ({ ...state, [key]: !state[key] }),
  );

  async function toggleSetting(key) {
    toggleOptimistic(key); // Мгновенное переключение

    try {
      const newValue = !settings[key];
      await fetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: newValue }),
      });
      setSettings({ ...settings, [key]: newValue });
    } catch {
      // Автоматический откат
    }
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={optimisticSettings.notifications}
          onChange={() => toggleSetting("notifications")}
        />
        Notifications
      </label>
    </div>
  );
}
```

### Context без Provider — еще пример

**Example 2: Nested contexts**

**Before:**

```javascript
const ThemeContext = createContext();
const UserContext = createContext();

function App() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <Dashboard />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

function Dashboard() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);

  return <div className={theme}>{user?.name}</div>;
}
```

**After:**

```javascript
const ThemeContext = createContext();
const UserContext = createContext();

function App() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        <Dashboard />
      </UserContext>
    </ThemeContext>
  );
}

function Dashboard() {
  const theme = use(ThemeContext);
  const user = use(UserContext);

  return <div className={theme}>{user?.name}</div>;
}
```

### useFormStatus — еще пример

**Example 2: Progress Bar for File Uploads**

**Before:**

```javascript
function FileUploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      setProgress((e.loaded / e.total) * 100);
    });

    xhr.open("POST", "/api/upload");
    xhr.send(file);

    await new Promise((resolve) => {
      xhr.onload = resolve;
    });

    setUploading(false);
    setProgress(0);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button disabled={uploading}>Upload</button>
      {uploading && <progress value={progress} max={100} />}
    </form>
  );
}
```

**After:**

```javascript
function FileUploadForm() {
  async function handleUpload(formData) {
    const file = formData.get("file");
    await uploadFile(file);
  }

  return (
    <form action={handleUpload}>
      <input type="file" name="file" />
      <UploadButton />
    </form>
  );
}

function UploadButton() {
  const { pending, data } = useFormStatus();

  return (
    <>
      <button disabled={pending}>{pending ? "Uploading..." : "Upload"}</button>
      {pending && <progress />}
    </>
  );
}
```

## Итоговые выводы

Миграция с React 17 на 19 — это **переосмысление архитектуры**, а не косметический патч. Вот что критично:

**React Compiler:** Упрощает 80% кейсов, но требует понимания мемоизации для оставшихся 20%.[4]

**useActionState:** Убивает контролируемые инпуты в формах, но требует `<form action>`.[5]

**use():** Не замена `useEffect`, а инструмент для `Suspense`.[6][7]

**forwardRef removed:** `ref` is now a regular prop, as it should have been.

**Document Metadata:** React Helmet is dead, native solution is better.

**Async Transitions:** `useTransition` now supports async — UI never blocks.

**Ref Callbacks:** Cleanup functions make `useEffect` unnecessary for DOM operations.

**useOptimistic:** For UX, not for critical operations.

Each feature solves real problems but creates new constraints. Knowing them is an obligation, ignoring them is failure.
