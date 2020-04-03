import React, { useEffect, useState } from 'react';
import { Spin, Alert, Switch, Divider, Modal } from 'antd';
import math from 'mathjs';

import { validateRequired } from '../../../components/AdminForm/validations';
import { getConstants, updatePlugins } from '../Plugins/action';
import BrokerForm from './BrokerForm';

const generateForm = () => ({
    'quick_trade_rate': {
        type: 'number',
        label: 'Quick trade rate',
        placeholder: 'Quick trade rate',
        min: 0,
        max: 100,
        validate: [validateRequired]
    },
    'trade_master_account_id': {
        type: 'number',
        label: 'Trade master account id',
        placeholder: 'Trade master account id',
        validate: [validateRequired]
    }
});

const Broker = () => {
    const [loading, setLoading] = useState(false);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const [constants, setConstants] = useState({ secrets: {} });
    const [initialValues, setInitialValues] = useState({ quick_trade_rate: 3 });
    useEffect(() => {
        setLoading(true);
        getConstants()
            .then(res => {
                setConstants(res.constants);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const { secrets = { broker: {} } } = constants;
        let initialData = {}
        if (secrets.broker) {
            initialData = { ...secrets.broker };
            if (initialData.quick_trade_rate) {
                initialData.quick_trade_rate = math.multiply(initialData.quick_trade_rate, 100);
            }
            setInitialValues(initialData);
        }
    }, [constants]);

    const handleSwitch = (checked) => {
        if (checked) {
            handleBroker(checked);
        } else {
            handleDeactivate();
        }
        setServiceLoading(true);
    };

    const handleBroker = (checked) => {
        let formValues = {
            broker_enabled: checked
        };
        updateConstants(formValues);
    };

    const disableBroker = () => {
        handleBroker(false);
        handleDeactivate();
    };

    const updateConstants = (formProps) => {
        setError('');
        return updatePlugins(formProps)
            .then((data) => {
                setConstants(data);
                setServiceLoading(false);
                setLoading(false);
            })
            .catch((error) => {
                const message = error.data ? error.data.message : error.message;
                setError(message);
                setServiceLoading(false);
                setLoading(false);
            });
    };

    const handleDeactivate = () => {
        setOpenDialog(!openDialog);
        setServiceLoading(false);
    };

    const handleSubmitBroker = (formProps) => {
        let formValues = { broker: { ...formProps } };
        if (formProps.quick_trade_rate) {
            formValues.broker.quick_trade_rate = math.divide(formProps.quick_trade_rate, 100);
        }
        setLoading(true);
        updateConstants({ secrets: formValues });
    };

    const { broker_enabled = false } = constants;
    return (
        <div className="app_container-content">
            {error && (
                <Alert
                    message="Error"
                    className="m-top"
                    description={error}
                    type="error"
                    showIcon
                />
            )}
            {loading ? (
                <Spin size="large" />
            ) : (
                    <div>
                        <div className="d-flex align-items-center">
                            <h1>Broker</h1>
                            <div className="mx-4">
                                <Switch loading={serviceLoading} checked={broker_enabled} onChange={handleSwitch} />
                            </div>
                        </div>
                        <Divider />
                        {broker_enabled
                            ? <BrokerForm
                                initialValues={initialValues}
                                fields={generateForm()}
                                handleSubmitBroker={handleSubmitBroker}
                            />
                            : null
                        }
                        <Modal
                            title={`Deactivate Broker`}
                            visible={openDialog}
                            onOk={disableBroker}
                            onCancel={handleDeactivate}
                        >
                            <div>Do you really want to Disable Broker?</div>
                        </Modal>
                    </div>
                )}
        </div>
    )
};

export default Broker;
