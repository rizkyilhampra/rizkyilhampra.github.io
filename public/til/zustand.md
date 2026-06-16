---
slug: zustand
title: Zustand
date: 2025-08-24
tags: react, frontend
description: You maybe had like <App /> component that had 2 components <ProductList /> and <Cart />. How you can handle 'state' of cart management? The native way is define…
---
You maybe had like `<App />` component that had 2 components `<ProductList />` and `<Cart />`. How you can handle 'state' of **cart management**? The native way is define the 'state' in `<App />` component then pass through both components. The problem is what happens if there are so many 'state' that had been through pass? Maybe like this

```jsx
<ProductList
stateOfOne={state}
stateOfTwo={state}
stateOfThree={state}
/>
```

That's just three? How about like more than that? It's looks messy and hard to manage right? You ended up like in `<App />` it's contains bunch of state management with like different purpose. 

This is why Zustand help, it can be used to like create an global state management called 'store' with different purpose, let's say for cart management one then etc. So it will like make it into single purpose maybe related with SOLID principle, that wrap the like 'state' for each purpose into single file or maybe class that only do that purpose. Then the `<App />` can be just focused with anything don't need to deal with state management again.
