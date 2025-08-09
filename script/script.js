// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp , doc, updateDoc , where} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
         // fetchPastOrders() viene chiamato qui perchÃ© dipende dall'autenticazione
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
      showMessageModal("Errore di Inizializzazione", "Impossibile connettersi al servizio. Riprova piÃ¹ tardi.");
   } finally {
      // Assicurati che l'overlay di caricamento sia nascosto in ogni caso (successo o fallimento)
      hideLoading();
   }
}

// Data for hamburger ingredients
const ingredients = {
   bread: [
      { name: "Panino Classico", price: 1.50 },
      { name: "Panino al Sesamo", price: 1.75 },
      { name: "Panino Integrale", price: 2.00 }
   ],
   meat: [
      { name: "Manzo (100g)", price: 3.00 },
      { name: "Doppio Manzo (2 X 100g)", price: 5.00 },
      { name: "Pollo Grigliato", price: 2.80 },
      { name: "Vegetariano", price: 2.50 }
   ],
   cheese: [
      { name: "Cheddar", price: 0.80 },
      { name: "Scamorza affumicata", price: 1.00 },
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
         userId: userId,
         status: 'pending' // Default status for new orders
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
            // Aggiunto log per confermare lo stato dell'ordine
            console.log(order);
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-item';

            // Determina lo stato e lo stile in base al campo 'status'
            const status = order.status || 'pending';
            const statusText = status === 'ready' ? 'Pronto ✅' : 'In preparazione ⏳';
            const statusColorClass = status === 'ready' ? 'text-green-600' : 'text-yellow-600';

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

            orderDetails += `<p><strong>Stato:</strong> <span class="font-bold ${statusColorClass}">${statusText}</span></p>`;
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

username.addEventListener('change', () => { 
   if (username.value.toUpperCase().trim() === 'RIC-ADMIN' || username.value.toUpperCase().trim() === 'ADM-RIC') {
      // If the username is "RIC-ADMIN", set a special user ID for admin purposes
      showMessageModal("Accesso Amministratore", "Sei entrato in modalità amministratore. Ora puoi gestire gli ordini.");
      document.getElementById('welcome-section').classList.add('hidden');
      document.getElementById('ingredients-section').classList.add('hidden');
      document.getElementById('orders-section').classList.add('hidden');
      document.getElementById('past-orders-section').classList.add('hidden');
      document.getElementById('adm-orders-section').classList.remove('hidden');  
      // Fetch and render orders for admin
      fetchAndRenderOrders();
   }

});

const ordersListDiv = document.getElementById('orders-list');

function renderOrders(orders) {
    ordersListDiv.innerHTML = ''; // Clear previous orders
    if (orders.length === 0) {
        ordersListDiv.innerHTML = '<p class="text-gray-500 text-center col-span-full">Nessun ordine in arrivo.</p>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
       orderCard.className = 'order-card flex flex-col justify-between';
       orderCard.id = `${order.id}`;
        
        // Imposta lo stato predefinito se non esiste (utile per ordini vecchi o senza stato)
        const currentStatus = order.status || 'pending'; 
        const statusClass = currentStatus === 'ready' ? 'status-ready' : 'status-pending';
        const statusText = currentStatus === 'ready' ? 'Pronto' : 'In preparazione';

        const ingredientsList = [
            order.bread?.name,
            order.meat?.name,
            ...(order.cheese || []).map(c => c.name),
            ...(order.veg || []).map(v => v.name),
            ...(order.sauce || []).map(s => s.name)
        ].filter(Boolean).join(', ');

        orderCard.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">Nome: ${order.name}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="order-details">
                    <p><strong>Ingredienti:</strong> ${ingredientsList}</p>
                    <p><strong>Totale:</strong> €${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                    <p><strong>Ora ordine:</strong> ${order.timestamp ? new Date(order.timestamp.toDate()).toLocaleString() : 'N/A'}</p>
                </div>
            </div>
            ${currentStatus !== 'ready' ? `
                <div class="mt-4">
                    <button id="order-adm-button" class="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition mt-6" data-id="${order.id}">Panino pronto</button>
                </div>
            ` : ''}
        `;
        ordersListDiv.appendChild(orderCard);
    });

    document.querySelectorAll('#order-adm-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const orderId = e.target.dataset.id;
            await markOrderAsReady(orderId);
            // Nascondi il pulsante dopo averlo cliccato
            document.getElementById(orderId).innerHTML = '';
        });
    });
}

async function markOrderAsReady(orderId) {
    showLoading();
    try {
        const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
        await updateDoc(orderRef, {
            status: 'ready'
        });
        console.log(`Order ${orderId} marked as ready.`);
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Si è verificato un errore durante l'aggiornamento dell'ordine.");
    } finally {
        hideLoading();
    }
}

function fetchAndRenderOrders() {
    const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
    // Ordina per timestamp in ordine decrescente (i più recenti in alto)
    const q = query(ordersCollectionRef, where("status", "==", "pending")); // Filtra solo gli ordini in arrivo

    onSnapshot(q, (snapshot) => {
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        renderOrders(orders);
    }, (error) => {
        console.error("Error fetching orders:", error);
        ordersListDiv.innerHTML = '<p class="text-red-500 text-center col-span-full">Errore nel caricamento degli ordini in tempo reale.</p>';
    });
}



// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
   renderIngredients();
   console.log("Ingredients rendered."); // Aggiunto log per confermare il rendering
   updateOrderSummary(); // Riepilogo iniziale
   initializeFirebase();
   fetchAndRenderOrders();
});