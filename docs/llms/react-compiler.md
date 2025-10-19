# React Compiler

React Compiler is a new build-time tool that automatically optimizes your React app to improve its performance, particularly on updates (re-renders). The compiler is designed to work with existing JavaScript (and TypeScript) and understands the [Rules of React](https://react.dev/reference/rules). If your app follows those rules you generally won't need to rewrite any code to use it. We've been testing the compiler at Meta and it's already powering a few production surfaces like instagram.com.

In order to optimize applications, React Compiler automatically memoizes your code. You may be familiar today with memoization through APIs such as `useMemo`, `useCallback`, and `React.memo`. With these APIs you can tell React that certain parts of your application don't need to recompute if their inputs haven't changed, reducing work on updates. While powerful, it's easy to forget to apply memoization or apply them incorrectly. This can lead to inefficient updates as React has to check parts of your UI that don't have any _meaningful_ changes.

The compiler uses its knowledge of JavaScript and the Rules of React to automatically memoize values or groups of values within your components and hooks. If it detects breakages of the rules, it will automatically skip over just those components or hooks, and continue safely compiling other code.

If your codebase is already very well-memoized, you might not expect to see major performance improvements with the compiler. However, in practice memoizing the correct dependencies that cause performance issues is tricky to get right by hand.

While the compiler is mostly decoupled from Babel, it is currently the primary integration we support for the short-term. Most of the popular React frameworks do have Babel support as fallbacks and so React Compiler can still be used with them. Please refer to [the docs for an installation guide](https://react.dev/learn/react-compiler#installation). We are looking into other integrations as well and will share more when we have made progress.

## What does the compiler do?
It's helpful to first understand the main use cases of memoization in React today:

1. **Skipping cascading re-rendering of components (perf)**
   
   * Re-rendering `<Parent />` causes many components in its component tree to re-render, even though only `<Parent />` has changed
2. **Skipping expensive calculations from outside of React (perf)**
   
   * For example, calling `expensivelyProcessAReallyLargeArrayOfObjects()` inside of your component or hook that needs that data
3. **Memoizing deps to effects**
   
   * To ensure that a dependency of a hook is still `===` on re-rendering so as to prevent an infinite loop in a hook such as `useEffect()`

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
      {friends.map((friend) =(
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
function expensivelyProcessAReallyLargeArrayOfObjects() { /* ... */ } 

// Memoized by React Compiler since this is a component
function TableContainer({ items }) {
  // This function call would be memoized:
  const data = expensivelyProcessAReallyLargeArrayOfObjects(items);
  // ...
}
```

However, if `expensivelyProcessAReallyLargeArrayOfObjects` is truly an expensive function, you may want to consider implementing its own memoization outside of React, because:

* React Compiler only memoizes React components and hooks, not every function
* React Compiler's memoization is not shared across multiple components or hooks

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

// babel.config.js
module.exports = {
  plugins: [
    // Global plugins that apply to all files
  ],
  overrides: [
    {
      test: './src/modern/**/*.{js,jsx,ts,tsx}',
      plugins: [
        'babel-plugin-react-compiler'
      ]
    }
  ]
};
### Expanding Coverage 
As you gain confidence, add more directories:

// babel.config.js
module.exports = {
  plugins: [
    // Global plugins
  ],
  overrides: [
    {
      test: ['./src/modern/**/*.{js,jsx,ts,tsx}', './src/features/**/*.{js,jsx,ts,tsx}'],
      plugins: [
        'babel-plugin-react-compiler'
      ]
    },
    {
      test: './src/legacy/**/*.{js,jsx,ts,tsx}',
      plugins: [
        // Different plugins for legacy code
      ]
    }
  ]
};
### With Compiler Options 
You can also configure compiler options per override:

// babel.config.js
module.exports = {
  plugins: [],
  overrides: [
    {
      test: './src/experimental/**/*.{js,jsx,ts,tsx}',
      plugins: [
        ['babel-plugin-react-compiler', {
          // options ...
        }]
      ]
    },
    {
      test: './src/production/**/*.{js,jsx,ts,tsx}',
      plugins: [
        ['babel-plugin-react-compiler', {
          // options ...
        }]
      ]
    }
  ]
};
### Opt-in Mode with “use memo” 
For maximum control, you can use compilationMode: 'annotation' to only compile components and hooks that explicitly opt in with the "use memo" directive.

### Note
This approach gives you fine-grained control over individual components and hooks. It’s useful when you want to test the compiler on specific components without affecting entire directories.

### Annotation Mode Configuration 
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      compilationMode: 'annotation',
    }],
  ],
};
### Using the Directive 
Add "use memo" at the beginning of functions you want to compile:

function TodoList({ todos }) {
  "use memo"; // Opt this component into compilation

  const sortedTodos = todos.slice().sort();

  return (
    <ul>
      {sortedTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function useSortedData(data) {
  "use memo"; // Opt this hook into compilation

  return data.slice().sort();
}
With compilationMode: 'annotation', you must:

Add "use memo" to every component you want optimized
Add "use memo" to every custom hook
Remember to add it to new components
This gives you precise control over which components are compiled while you evaluate the compiler’s impact.

## Runtime Feature Flags with Gating 
The gating option enables you to control compilation at runtime using feature flags. This is useful for running A/B tests or gradually rolling out the compiler based on user segments.

### How Gating Works 
The compiler wraps optimized code in a runtime check. If the gate returns true, the optimized version runs. Otherwise, the original code runs.

### Gating Configuration 
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      gating: {
        source: 'ReactCompilerFeatureFlags',
        importSpecifierName: 'isCompilerEnabled',
      },
    }],
  ],
};
### Implementing the Feature Flag 
Create a module that exports your gating function:

// ReactCompilerFeatureFlags.js
export function isCompilerEnabled() {
  // Use your feature flag system
  return getFeatureFlag('react-compiler-enabled');
}
Troubleshooting Adoption 
If you encounter issues during adoption:

- Use "use no memo" to temporarily exclude problematic components
- Check the debugging guide for common issues
- Fix Rules of React violations identified by the ESLint plugin
- Consider using compilationMode: 'annotation' for more gradual adoption