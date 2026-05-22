import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createSensorData } from "../../lib/api.js";

export function InsertForm() {
  const [sensorId, setSensorId] = useState("sensor-demo");
  const [value, setValue] = useState("42.5");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSensorData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensorData"] });
      setValue((Math.random() * 100).toFixed(2));
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ sensorId, value: parseFloat(value) });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">Sensor ID</span>
        <input
          className="w-full rounded border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-300"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">Value</span>
        <input
          className="w-full rounded border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-300"
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="self-end rounded bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:opacity-50"
      >
        {mutation.isPending ? "Saving" : "Insert"}
      </button>
      {mutation.isError && (
        <p className="text-sm text-red-200 sm:col-span-3">
          {mutation.error.message}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-teal-200 sm:col-span-3">Record inserted.</p>
      )}
    </form>
  );
}
