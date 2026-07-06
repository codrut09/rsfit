package com.rsfit.coaching.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CoachClientRelationshipId implements Serializable {
    private UUID coachId;
    private UUID clientId;

    public CoachClientRelationshipId() {}

    public CoachClientRelationshipId(UUID coachId, UUID clientId) {
        this.coachId = coachId;
        this.clientId = clientId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CoachClientRelationshipId that = (CoachClientRelationshipId) o;
        return Objects.equals(coachId, that.coachId) && Objects.equals(clientId, that.clientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(coachId, clientId);
    }
}
