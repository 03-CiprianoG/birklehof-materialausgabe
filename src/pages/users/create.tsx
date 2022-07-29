import React, { useState } from 'react';
import Layout from '../../components/layout';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';

export default function createSalePage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('seller');
  const { addToast } = useToasts();

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { name: name, email: email, role: role };
      const res = await fetch(`/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status === 200) {
        addToast('Benutzer erfolgreich erstellt', {
          appearance: 'success',
          autoDismiss: true
        });
        Router.push('/users');
      } else if (res.status === 400) {
        const json = await res.json();
        if (json.message) {
          addToast(json.message, {
            appearance: 'error',
            autoDismiss: true
          });
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true
          });
        }
      } else if (res.status === 403) {
        addToast('Fehlende Berechtigung', {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        const json = await res.json();
        addToast(json.error.toString(), {
          appearance: 'success',
          autoDismiss: true
        });
      }
    } catch (error) {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // If the user is not authenticated or does not have the correct role, display access denied message
  if (!session || session.userRole !== 'superadmin') {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={'form'}>
        <h1 className={'form-heading'}>Benutzer erstellen</h1>
        <form onSubmit={submitData}>
          <label htmlFor="name">
            <span>
              Name <span className="required">*</span>
            </span>
            <input
              name={'name'}
              className={'input-field'}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              type="text"
              value={name}
              required
            />
          </label>
          <label htmlFor="email">
            <span>
              E-Mail <span className="required">*</span>
            </span>
            <input
              name={'email'}
              className={'input-field'}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              type="text"
              value={email}
              required
            />
          </label>
          <label htmlFor="role">
            <span>
              Rolle <span className="required">*</span>
            </span>
            <select
              name={'role'}
              className="select-field"
              onChange={(e) => setRole(e.target.value)}
              value={role}
              required
            >
              <option value="admin">Admin</option>
              <option value="seller">Verkäufer</option>
            </select>
          </label>
          <input type="submit" value="Erstellen" disabled={!name || !email || !role} />
          <a className={'back'} href="#" onClick={() => Router.push('/users')}>
            Abbrechen
          </a>
        </form>
      </div>
    </Layout>
  );
}
