// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables provided by the Canvas environment (ideally)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let userId = null;
let isAuthReady = false;

// Show loading overlay
function showLoading() {
   document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
   document.getElementById('loadingOverlay').style.display = 'none';
}

// Initialize Firebase and authenticate
async function initializeFirebase() {
   showLoading(); // Mostra l'overlay di caricamento
   try {
      // *** INCOLLA QUI LA TUA CONFIGURAZIONE FIREBASE REALE ***
      // QUESTI SONO SOLO DEI SEGNAPOSTO. DEVI SOSTITUIRLI CON I VALORI ESATTI
      // CHE TROVI NELLA TUA CONSOLE FIREBASE (Impostazioni progetto > Le tue app > La tua app web).
      const myFirebaseConfig = {
         apiKey: "AIzaSyBsAbVpNHUjoy34mRtwZNpjpzjgGAdjgl0",
         authDomain: "porject-smash.firebaseapp.com",
         projectId: "porject-smash",
         storageBucket: "porject-smash.firebasestorage.app",
         messagingSenderId: "923159910686",
         appId: "1:923159910686:web:24ae5ac9df5426f5c1510f"
      };
      // *** FINE CONFIGURAZIONE FIREBASE REALE ***

      console.log("Using Firebase Config:", myFirebaseConfig); // Log per debug

      // Usa la configurazione appena definita
      app = initializeApp(myFirebaseConfig);

      db = getFirestore(app);
      auth = getAuth(app);

      // Listen for auth state changes
      onAuthStateChanged(auth, async (user) => {
         if (user) {
            userId = user.uid;
            console.log("Authenticated user ID:", userId);
         } else {
            // If no user, sign in anonymously if initialAuthToken is not available
            if (!initialAuthToken) {
               await signInAnonymously(auth);
               userId = auth.currentUser?.uid || crypto.randomUUID(); // Fallback for anonymous
               console.log("Signed in anonymously. User ID:", userId);
            }
         }
         isAuthReady = true;
         // fetchPastOrders() viene chiamato qui perché dipende dall'autenticazione
         fetchPastOrders();
      });

      // Sign in with custom token if available, otherwise anonymously
      if (initialAuthToken) {
         await signInWithCustomToken(auth, initialAuthToken);
         console.log("Signed in with custom token.");
      } else {
         await signInAnonymously(auth);
         console.log("Signed in anonymously.");
      }

   } catch (error) {
      console.error("Error initializing Firebase or authenticating:", error);
      showMessageModal("Errore di Inizializzazione", "Impossibile connettersi al servizio. Riprova più tardi.");
   } finally {
      // Assicurati che l'overlay di caricamento sia nascosto in ogni caso (successo o fallimento)
      hideLoading();
   }
}

// Data for hamburger ingredients
const ingredients = {
   bread: [
      { name: "Panino Classico", price: 1.50 , img: "https://i.pinimg.com/736x/59/55/d7/5955d7947ef09e913248fec8660b3c9c.jpg" },
      // { name: "Panino al Sesamo", price: 1.75 },
      // { name: "Panino Integrale", price: 2.00 }
   ],
   meat: [
      { name: "Manzo (100g)", price: 3.00 },
      { name: "Doppio Manzo (2 X 100g)", price: 5.00 },
      // { name: "Pollo Grigliato", price: 2.80 },
      // { name: "Vegetariano", price: 2.50 }
   ],
   cheese: [
      { name: "Cheddar", price: 0.80 },
      // { name: "Mozzarella", price: 0.70 },
      // { name: "Gorgonzola", price: 1.00 }
   ],
   veg: [
      { name: "Lattuga", price: 0.30 },
      { name: "Pomodoro", price: 0.40 },
      { name: "Cipolla croccante", price: 0.60 },
      { name: "Bacon Croccante", price: 1.20 }
   ],
   sauce: [
      { name: "Ketchup", price: 0.20 },
      { name: "Maionese", price: 0.20 },
      { name: "Salsa BBQ", price: 0.50 },
      { name: "Salsa Speciale", price: 0.70 }
   ]
};

let selectedIngredients = {
   bread: null,
   meat: null,
   cheese: [],
   veg: [],
   sauce: []
};

// DOM elements
const breadOptionsDiv = document.getElementById('bread-options');
const meatOptionsDiv = document.getElementById('meat-options');
const cheeseOptionsDiv = document.getElementById('cheese-options');
const vegOptionsDiv = document.getElementById('veg-options');
const sauceOptionsDiv = document.getElementById('sauce-options');
const selectedIngredientsDiv = document.getElementById('selected-ingredients');
const totalPriceSpan = document.getElementById('total-price');
const orderButton = document.getElementById('order-button');
const confirmationModal = document.getElementById('confirmationModal');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const messageModal = document.getElementById('messageModal');
const messageModalTitle = document.getElementById('messageModalTitle');
const messageModalText = document.getElementById('messageModalText');
const messageModalCloseBtn = document.getElementById('messageModalCloseBtn');
const pastOrdersList = document.getElementById('past-orders-list');
const username = document.getElementById('username');

// Function to render ingredient options
function renderIngredients() {
   // Clear previous options
   breadOptionsDiv.innerHTML = '';
   meatOptionsDiv.innerHTML = '';
   cheeseOptionsDiv.innerHTML = '';
   vegOptionsDiv.innerHTML = '';
   sauceOptionsDiv.innerHTML = '';

   // Render bread options (radio buttons - single selection)
   ingredients.bread.forEach(item => {
      const div = document.createElement('div');
      div.className = 'ingredient-item';
      div.innerHTML = `
                    <input type="radio" name="bread" value="${item.name}" data-price="${item.price}" class="form-radio text-blue-600">
                    <img src="${item.img || ''}" alt="${item.name}" class="w-8 h-8 inline-block mr-2">
                    <label>${item.name} (€${item.price.toFixed(2)})</label>
                `;
      breadOptionsDiv.appendChild(div);
   });

   // Render meat options (radio buttons - single selection)
   ingredients.meat.forEach(item => {
      const div = document.createElement('div');
      div.className = 'ingredient-item';
      div.innerHTML = `
                    <input type="radio" name="meat" value="${item.name}" data-price="${item.price}" class="form-radio text-blue-600">
                    <label>${item.name} (€${item.price.toFixed(2)})</label>
                `;
      meatOptionsDiv.appendChild(div);
   });

   // Render cheese, veg, sauce options (checkboxes - multiple selection)
   ['cheese', 'veg', 'sauce'].forEach(category => {
      const targetDiv = document.getElementById(`${category}-options`);
      ingredients[category].forEach(item => {
         const div = document.createElement('div');
         div.className = 'ingredient-item';
         div.innerHTML = `
                        <input type="checkbox" name="${category}" value="${item.name}" data-price="${item.price}" class="form-checkbox text-blue-600 rounded">
                        <label>${item.name} (€${item.price.toFixed(2)})</label>
                    `;
         targetDiv.appendChild(div);
      });
   });

   // Add event listeners for ingredient selection
   document.querySelectorAll('.ingredient-group input').forEach(input => {
      input.addEventListener('change', updateSelection);
   });
}

// Function to update selected ingredients and total price
function updateSelection(event) {
   const category = event.target.name;
   const name = event.target.value;
   const price = parseFloat(event.target.dataset.price);

   if (event.target.type === 'radio') {
      // For radio buttons (bread, meat), only one can be selected
      selectedIngredients[category] = { name, price };
   } else if (event.target.type === 'checkbox') {
      // For checkboxes (cheese, veg, sauce), multiple can be selected
      if (event.target.checked) {
         selectedIngredients[category].push({ name, price });
      } else {
         selectedIngredients[category] = selectedIngredients[category].filter(item => item.name !== name);
      }
   }
   updateOrderSummary();
}

// Function to update the order summary and total price display
function updateOrderSummary() {
   let total = 0;
   let summaryHtml = '';

   // Add bread and meat if selected
   if (selectedIngredients.bread) {
      summaryHtml += `<p><strong>Panino:</strong> ${selectedIngredients.bread.name}</p>`;
      total += selectedIngredients.bread.price;
   }
   if (selectedIngredients.meat) {
      summaryHtml += `<p><strong>Carne:</strong> ${selectedIngredients.meat.name}</p>`;
      total += selectedIngredients.meat.price;
   }

   // Add multiple selections (cheese, veg, sauce)
   ['cheese', 'veg', 'sauce'].forEach(category => {
      if (selectedIngredients[category].length > 0) {
         summaryHtml += `<p><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> `;
         summaryHtml += selectedIngredients[category].map(item => {
            total += item.price;
            return `${item.name}`;
         }).join(', ');
         summaryHtml += `</p>`;
      }
   });

   if (summaryHtml === '') {
      selectedIngredientsDiv.innerHTML = '<p>Nessun ingrediente selezionato.</p>';
   } else {
      selectedIngredientsDiv.innerHTML = summaryHtml;
   }
   totalPriceSpan.textContent = `Totale: €${total.toFixed(2)}`;
}

// Show confirmation modal
function showConfirmationModal() {
   confirmationModal.classList.remove('hidden');
   confirmationModal.classList.add('flex');
   confirmationModal.classList.add('show');
}

// Hide confirmation modal
function hideConfirmationModal() {
   confirmationModal.classList.remove('show');
   confirmationModal.classList.remove('flex');
   confirmationModal.classList.add('hidden');
}

// Show generic message modal
function showMessageModal(title, message) {
   messageModalTitle.textContent = title;
   messageModalText.textContent = message;
   messageModal.classList.remove('hidden');
   messageModal.classList.add('flex');
   messageModal.classList.add('show');
}

// Hide generic message modal
function hideMessageModal() {
   messageModal.classList.remove('show');
   messageModal.classList.remove('flex');
   messageModal.classList.add('hidden');
}

// Handle order submission
orderButton.addEventListener('click', () => {

   if (!selectedIngredients.bread || !selectedIngredients.meat) {
      console.log("crash");
      showMessageModal("Selezione Incompleta", "Per favore, seleziona un panino e un tipo di carne.");
      return;
   } 
   if (username.value.trim() === '') {
      showMessageModal("Nome Richiesto", "Per favore, inserisci il tuo nome per completare l'ordine.");
      return;
   }
   showConfirmationModal();
});

// Confirm order button click
confirmOrderBtn.addEventListener('click', async () => {
   hideConfirmationModal();
   showLoading();
   try {
      if (!isAuthReady || !userId) {
         throw new Error("Firebase authentication not ready. Please wait.");
      }

      // Prepare order data
      const orderData = {
         bread: selectedIngredients.bread,
         meat: selectedIngredients.meat,
         cheese: selectedIngredients.cheese,
         veg: selectedIngredients.veg,
         sauce: selectedIngredients.sauce,
         totalPrice: parseFloat(totalPriceSpan.textContent.replace('Totale: €', '')),
         timestamp: serverTimestamp(),
         name: username.value,
         userId: userId // Store the user ID for filtering orders
      };

      // Save to Firestore
      const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
      await addDoc(ordersCollectionRef, orderData);

      showMessageModal("Ordine Inviato!", "Il tuo ordine è stato inviato con successo!");
      resetSelection(); // Reset form after successful order
   } catch (error) {
      console.error("Error submitting order:", error);
      showMessageModal("Errore Ordine", "Si è verificato un errore durante l'invio dell'ordine. Riprova.");
   } finally {
      hideLoading();
   }
});

// Cancel order button click
cancelOrderBtn.addEventListener('click', () => {
   hideConfirmationModal();
});

// Close message modal button click
messageModalCloseBtn.addEventListener('click', () => {
   hideMessageModal();
});

// Reset form selection
function resetSelection() {
   // Reset radio buttons
   document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
   // Reset checkboxes
   document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);

   selectedIngredients = {
      bread: null,
      meat: null,
      cheese: [],
      veg: [],
      sauce: []
   };
   updateOrderSummary();
}


// Fetch and display past orders
function fetchPastOrders() {
   if (!isAuthReady || !userId) {
      console.log("Authentication not ready or userId not available for fetching past orders.");
      return;
   }

   // Query orders for the current user, ordered by timestamp
   // Note: orderBy() is avoided as per instructions, so we'll sort in memory.
   const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
   const q = query(ordersCollectionRef); // No orderBy here

   onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach(doc => {
         const data = doc.data();
         // Filter by userId locally
         if (data.userId === userId) {
            orders.push({ id: doc.id, ...data });
         }
      });

      // Sort orders by timestamp in descending order (most recent first)
      orders.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));


      pastOrdersList.innerHTML = ''; // Clear previous list
      if (orders.length === 0) {
         pastOrdersList.innerHTML = '<p class="text-gray-500 text-center">Nessun ordine precedente.</p>';
      } else {
         orders.forEach(order => {
            console.log(order);
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-item';
            let orderDetails = `<p><strong>Nome:</strong> ${order.name}</p>`;
            orderDetails += `<p><strong>Panino:</strong> ${order.bread ? order.bread.name : 'N/A'}</p>`;
            orderDetails += `<p><strong>Carne:</strong> ${order.meat ? order.meat.name : 'N/A'}</p>`;
            if (order.cheese && order.cheese.length > 0) {
               orderDetails += `<p><strong>Formaggi:</strong> ${order.cheese.map(c => c.name).join(', ')}</p>`;
            }
            if (order.veg && order.veg.length > 0) {
               orderDetails += `<p><strong>Verdure:</strong> ${order.veg.map(v => v.name).join(', ')}</p>`;
            }
            if (order.sauce && order.sauce.length > 0) {
               orderDetails += `<p><strong>Salse:</strong> ${order.sauce.map(s => s.name).join(', ')}</p>`;
            }
            if (order.timestamp) {
               orderDetails += `<p><strong>Data:</strong> ${new Date(order.timestamp.toDate()).toLocaleString()}</p>`;
            }
            orderDetails += `<p class="font-bold text-green-600">Totale: €${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>`;
            orderDiv.innerHTML = orderDetails;
            pastOrdersList.appendChild(orderDiv);
         });
      }
   }, (error) => {
      console.error("Error fetching past orders:", error);
      pastOrdersList.innerHTML = '<p class="text-red-500 text-center">Errore nel caricamento degli ordini.</p>';
   });
}


// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
   renderIngredients();
   console.log("Ingredients rendered."); // Aggiunto log per confermare il rendering
   updateOrderSummary(); // Riepilogo iniziale
   initializeFirebase();
});