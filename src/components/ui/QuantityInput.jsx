const QuantityInput = ({ quantity, onIncrease, onDecrease, min = 0, max = 99, disabled = false }) => {
  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className="grid h-10 w-10 place-items-center text-lg font-bold text-ink-600 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-12 text-center text-sm font-bold text-ink-950">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        className="grid h-10 w-10 place-items-center text-lg font-bold text-ink-600 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
