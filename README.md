# chemie-reaktionsgleichung

Ein Programm um Reaktionsgleichungen ausgleichen.

## Solving a System of Linear Equations using substitution

### Algorythm

1. Invert the coeficients of the product side.
2. Find the equation, were the most coeficions aren't $0$
3. Find the firs variable, that has no coeficient of $0$
4. Invert all coeficions, and move them to the product side, except the chosen one in 3.
5. Divide all coeficients by the coeficient of the previously chosen one.
6. Substitute all coeficients of the same variable (inverted) in the other equations
7. Repeat from **Step 1** 

### Example

$$a \cdot H_2 + b \cdot O_2 \rightarrow c \cdot H_2O$$

---

$H: 2a + 0b = 2c$  
$O: 0a + 2b = 1c$

---

$H: 2a + 0b - 2c = 0$  
$O: 0a + 2b - 1c = 0$

---

$$a = \frac{-0b + 2c}{2} = -0b + 1c$$

---

$$0 \cdot (0b - 1c) + 2b - 1c = 0$$
$$(2b + 0 \cdot 0b) + (-1c + 0 \cdot -1c) = 0$$
$$2b - 1c = 0$$

---

$$b = \frac{1c}{2} = 0.5c$$
