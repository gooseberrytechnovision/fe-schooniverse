import React, { useEffect, useState } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import { fetchGlobalSettings, updateGlobalSettings } from "../../actions/admin";
import FullPageSpinner from "../layout/FullPageSpinner";
import { toast } from "react-toastify";

const Settings = () => {
  const [settings, setSettings] = useState({
    enableIndividualProducts: true,
    enableBulkProducts: true,
    enablePurchasing: true
  });
  const [loading, setLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await fetchGlobalSettings();
        if (response.success) {
          setSettings({
            enableIndividualProducts: response.settings.enableIndividualProducts ?? true,
            enableBulkProducts: response.settings.enableBulkProducts ?? true,
            enablePurchasing: response.settings.enablePurchasing ?? true
          });
        }
      } catch (error) {
        toast.error("Failed to load settings", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSave = () => {
    setShowSecurityModal(true);
  };

  const handleSecurityCodeChange = (e) => {
    setSecurityCode(e.target.value);
  };

  const handleSecurityCodeSubmit = async () => {
    if (!securityCode.trim()) {
      toast.error("Security code is required", { position: "top-right" });
      return;
    }

    setLoading(true);
    try {
      await updateGlobalSettings({
        ...settings,
        securityCode
      });
      
      setShowSecurityModal(false);
      setSecurityCode("");
    } catch (error) {
      toast.error("Failed to update settings. Invalid security code.", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">Global Settings</h4>
            </div>
            <div className="card-body">
              <Form>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <h5 className="mb-0">Enable Individual Products</h5>
                      <p className="text-muted small mb-0">
                        Allow customers to view individual products
                      </p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="enable-individual-products"
                      checked={settings.enableIndividualProducts}
                      onChange={() => handleToggle("enableIndividualProducts")}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <h5 className="mb-0">Enable Bulk Products</h5>
                      <p className="text-muted small mb-0">
                        Allow customers to view bulk products
                      </p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="enable-bulk-products"
                      checked={settings.enableBulkProducts}
                      onChange={() => handleToggle("enableBulkProducts")}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <h5 className="mb-0">Enable Purchasing</h5>
                      <p className="text-muted small mb-0">
                        Enable/disable all purchasing functionality
                      </p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="enable-purchasing"
                      checked={settings.enablePurchasing}
                      onChange={() => handleToggle("enablePurchasing")}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Security Code Modal */}
      <Modal show={showSecurityModal} onHide={() => setShowSecurityModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Security Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Please enter the security code to save settings</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter security code"
              value={securityCode}
              onChange={handleSecurityCodeChange}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSecurityModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSecurityCodeSubmit}>
            Verify & Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Settings; 