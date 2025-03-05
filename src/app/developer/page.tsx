"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DeveloperPage() {
  const [settingsJson, setSettingsJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const json = await invoke<string>("get_raw_settings");
      setSettingsJson(json);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Developer Settings</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={fetchSettings}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Settings JSON</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center">Loading settings...</div>
            ) : (
              <pre className="p-6 overflow-auto text-sm font-mono h-[70vh] bg-gray-50 dark:bg-gray-900 rounded-md">
                {settingsJson}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
