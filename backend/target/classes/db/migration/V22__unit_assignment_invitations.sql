CREATE TABLE IF NOT EXISTS unit_assignment_invitations (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    invitee_email VARCHAR(150) NOT NULL,
    invitee_name VARCHAR(150),
    invitation_role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    invitation_token VARCHAR(64) NOT NULL UNIQUE,
    invited_by_user_id BIGINT,
    accepted_by_user_id BIGINT,
    accepted_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_unit_assignment_invitation_unit
        FOREIGN KEY (unit_id) REFERENCES building_units(id) ON DELETE CASCADE,
    CONSTRAINT fk_unit_assignment_invitation_invited_by
        FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_unit_assignment_invitation_accepted_by
        FOREIGN KEY (accepted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_unit_assignment_invitations_unit_role_status
    ON unit_assignment_invitations(unit_id, invitation_role, status);

CREATE INDEX IF NOT EXISTS idx_unit_assignment_invitations_email_status
    ON unit_assignment_invitations(invitee_email, status);

CREATE INDEX IF NOT EXISTS idx_unit_assignment_invitations_expires_at
    ON unit_assignment_invitations(expires_at);

