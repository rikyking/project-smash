import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../firebase";
import { ingredients, emptySelection } from "../data/ingredients";
import type { SelectedIngredients, Ingredient } from "../data/ingredients";
import ConfirmationModal from "./ConfirmationModal";
import MessageModal from "./MessageModal";
import PastOrders from "./PastOrders";
import LoadingOverlay from "./LoadingOverlay";

interface Props {
  userId: string;
  userName: string;
}

export default function MainContent({ userId, userName }: Props) {
  const [selected, setSelected] = useState<SelectedIngredients>(emptySelection);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ title: string; text: string } | null>(null);

  const total = [
    selected.bread?.price ?? 0,
    selected.meat?.price ?? 0,
    ...selected.cheese.map((i) => i.price),
    ...selected.veg.map((i) => i.price),
    ...selected.sauce.map((i) => i.price),
  ].reduce((sum, price) => sum + price, 0);

  function handleRadio(category: "bread" | "meat", item: Ingredient) {
    setSelected((prev) => ({ ...prev, [category]: item }));
  }

  function handleCheckbox(
    category: "cheese" | "veg" | "sauce",
    item: Ingredient,
    checked: boolean
  ) {
    setSelected((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category], item]
        : prev[category].filter((i) => i.name !== item.name),
    }));
  }

  function handleOrderClick() {
    if (!selected.bread || !selected.meat) {
      setMessage({
        title: "Selezione incompleta",
        text: "Seleziona un panino e un tipo di carne prima di ordinare.",
      });
      return;
    }

    setShowConfirm(true);
  }

  async function handleConfirmOrder() {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
      await addDoc(ordersRef, {
        bread: selected.bread,
        meat: selected.meat,
        cheese: selected.cheese,
        veg: selected.veg,
        sauce: selected.sauce,
        totalPrice: total,
        timestamp: serverTimestamp(),
        name: userName,
        userId,
        status: "pending",
      });

      setMessage({
        title: "Ordine inviato",
        text: "Il tuo ordine è stato inviato con successo.",
      });

      setSelected(emptySelection);
    } catch (error) {
      console.error("Errore invio ordine:", error);
      setMessage({
        title: "Errore",
        text: "Si è verificato un errore durante l'invio dell'ordine.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading && <LoadingOverlay />}

      <div className="container">
        <section className="intro-section">
          <h1 className="section-title">Ciao, {userName}</h1>
        </section>

        <section>
          <h2 className="section-title">Scegli i Tuoi Ingredienti</h2>

          <div className="ingredient-section">
            <h3 className="sub-title">Panino</h3>
            <div className="ingredient-group">
              {ingredients.bread.map((item) => (
                <label key={item.name} className="ingredient-item">
                  <input
                    type="radio"
                    name="bread"
                    checked={selected.bread?.name === item.name}
                    onChange={() => handleRadio("bread", item)}
                  />
                  <span>{item.name} (€{item.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ingredient-section">
            <h3 className="sub-title">Carne</h3>
            <div className="ingredient-group">
              {ingredients.meat.map((item) => (
                <label key={item.name} className="ingredient-item">
                  <input
                    type="radio"
                    name="meat"
                    checked={selected.meat?.name === item.name}
                    onChange={() => handleRadio("meat", item)}
                  />
                  <span>{item.name} (€{item.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ingredient-section">
            <h3 className="sub-title">Formaggi</h3>
            <div className="ingredient-group">
              {ingredients.cheese.map((item) => (
                <label key={item.name} className="ingredient-item">
                  <input
                    type="checkbox"
                    checked={selected.cheese.some((i) => i.name === item.name)}
                    onChange={(e) =>
                      handleCheckbox("cheese", item, e.target.checked)
                    }
                  />
                  <span>{item.name} (€{item.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ingredient-section">
            <h3 className="sub-title">Condimenti</h3>
            <div className="ingredient-group">
              {ingredients.veg.map((item) => (
                <label key={item.name} className="ingredient-item">
                  <input
                    type="checkbox"
                    checked={selected.veg.some((i) => i.name === item.name)}
                    onChange={(e) => handleCheckbox("veg", item, e.target.checked)}
                  />
                  <span>{item.name} (€{item.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ingredient-section">
            <h3 className="sub-title">Salse</h3>
            <div className="ingredient-group">
              {ingredients.sauce.map((item) => (
                <label key={item.name} className="ingredient-item">
                  <input
                    type="checkbox"
                    checked={selected.sauce.some((i) => i.name === item.name)}
                    onChange={(e) =>
                      handleCheckbox("sauce", item, e.target.checked)
                    }
                  />
                  <span>{item.name} (€{item.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="order-summary">
          <h2 className="section-title">Riepilogo ordine</h2>

          {!selected.bread &&
          !selected.meat &&
          selected.cheese.length === 0 &&
          selected.veg.length === 0 &&
          selected.sauce.length === 0 ? (
            <p>Nessun ingrediente selezionato.</p>
          ) : (
            <ul>
              {selected.bread && (
                <li><strong>Panino:</strong> {selected.bread.name}</li>
              )}
              {selected.meat && (
                <li><strong>Carne:</strong> {selected.meat.name}</li>
              )}
              {selected.cheese.length > 0 && (
                <li><strong>Formaggi:</strong> {selected.cheese.map((i) => i.name).join(", ")}</li>
              )}
              {selected.veg.length > 0 && (
                <li><strong>Condimenti:</strong> {selected.veg.map((i) => i.name).join(", ")}</li>
              )}
              {selected.sauce.length > 0 && (
                <li><strong>Salse:</strong> {selected.sauce.map((i) => i.name).join(", ")}</li>
              )}
            </ul>
          )}

          <p className="total-price">Totale: €{total.toFixed(2)}</p>

          <button className="btn btn-primary" onClick={handleOrderClick}>
            Invia ordine
          </button>
        </section>

        <PastOrders userId={userId} />
      </div>

      {showConfirm && (
        <ConfirmationModal
          total={total}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {message && (
        <MessageModal
          title={message.title}
          text={message.text}
          onClose={() => setMessage(null)}
        />
      )}
    </>
  );
}