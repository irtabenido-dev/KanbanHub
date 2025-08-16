export default function usePermissions() {
    const ROLE_PERMISSIONS = {
        'workspace.owner': [
            '*',
            'workspace_edit'
        ],

        'workspace.admin': [
            'create_boards',
            'edit_boards',
            'remove_boards',
            'restore_boards',
            'manage_workspace_users',
            'manage_board_users',
            'create_list',
            'edit_list',
            'remove_list',
            'restore_list',
            'create_task',
            'edit_task',
            'remove_task',
            'restore_task',
            'add_comment',
            'edit_comment',
            'remove_comment',
            'restore_comment',
        ],

        'workspace.member': [
            'create_boards',
            'restore_own_boards',
            'remove_own_boards',
            'workspace_manage_users'
        ],

        'board.owner': [
            'remove_own_boards',
            'manage_board_users',
            'create_list',
            'edit_list',
            'remove_list',
            'restore_list',
            'create_task',
            'edit_task',
            'remove_task',
            'restore_task',
            'add_comment',
            'edit_comment',
            'remove_comment',
            'restore_comment',
        ],

        'board.admin': [
            'create_list',
            'edit_list',
            'remove_list',
            'restore_list',
            'create_task',
            'edit_task',
            'remove_task',
            'restore_task',
            'add_comment',
            'edit_comment',
            'remove_comment',
            'restore_comment',
            'manage_board_users',
        ],

        'board.member': [
            'create_task',
            'edit_task',
            'remove_task',
            'add_comment',
            'edit_comment',
            'remove_comment',
        ],
    };

    const ROLE_HIERARCHY = {
        'workspace.owner': 5,
        'workspace.admin': 4,
        'board.owner': 3,
        'board.admin': 2,
        'board.member': 1,
        'workspace.member': 1
    };

    function getEffectiveRole(user) {
        const workspaceRole = user.workspaceRole || user.role;
        const boardRole = user.boardRole;

        const workspaceLevel = workspaceRole ? ROLE_HIERARCHY[`workspace.${workspaceRole}`] : 0;
        const boardLevel = boardRole ? ROLE_HIERARCHY[`board.${boardRole}`] : 0;

        if (workspaceLevel >= boardLevel) {
            return {
                type: 'workspace',
                role: workspaceRole,
                level: workspaceLevel,
                displayName: `Workspace ${workspaceRole}`,
            };
        } else {
            return {
                type: 'board',
                role: boardRole,
                level: boardLevel,
                displayName: `Board ${boardRole}`,
            };
        }
    }

    function hasPermission(user, permission) {
        const effectiveRole = getEffectiveRole(user);
        const roleKey = `${effectiveRole.type}.${effectiveRole.role}`;
        const permissions = ROLE_PERMISSIONS[roleKey] || [];

        return permissions.includes('*') || permissions.includes(permission);
    }

    function canTargetUser(actingUser, targetUser, commentEdit = false) {

        if (commentEdit) {
            return actingUser.id === targetUser.id;
        }

        if (actingUser.workspaceRole === 'owner') {
            return true;
        }

        if (actingUser.workspaceRole === 'admin' &&
            (targetUser.workspaceRole !== 'owner' &&
                targetUser.workspaceRole !== 'admin')
        ) {
            return true;
        }

        if (actingUser.boardRole === 'owner' &&
            (targetUser.workspaceRole !== 'owner' &&
                targetUser.workspaceRole !== 'admin')
        ) {
            return true;
        }

        if (actingUser.boardRole === 'admin' &&
            (targetUser.workspaceRole !== 'owner' &&
                targetUser.workspaceRole !== 'admin') &&
            (targetUser.boardRole !== 'owner' &&
                targetUser.boardRole !== 'admin')
        ) {
            return true;
        }

        return false;
    }

    return { getEffectiveRole, hasPermission, canTargetUser };
}
